import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import authService from "@/services/authService";
import { Eye, EyeOff, Check, X } from "lucide-react";

// Storage keys for persisting state
const STORAGE_KEY = 'kibegi_signup_state';
const ACCOUNT_CREATED_KEY = 'kibegi_account_created';

interface SignupState {
  step: "register" | "verify";
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "student" | "lecturer";
  };
  otp: string;
}

const Signup = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  
  // Load state from localStorage on mount
  const loadSavedState = (): SignupState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved signup state:', error);
    }
    return null;
  };

  // Save state to localStorage
  const saveState = (state: SignupState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save signup state:', error);
    }
  };

  // Clear saved state
  const clearSavedState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear saved signup state:', error);
    }
  };

  const savedState = loadSavedState();
  
  const [step, setStep] = useState<"register" | "verify">(savedState?.step || "register");
  const [formData, setFormData] = useState({
    fullName: savedState?.formData?.fullName || "",
    email: savedState?.formData?.email || "",
    password: "",
    confirmPassword: "",
    role: (savedState?.formData?.role || "student") as "student" | "lecturer",
  });
  const [otp, setOtp] = useState(savedState?.otp || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation state
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.password.length > 0,
  };

  // Restore state from localStorage on mount (only if not already set)
  useEffect(() => {
    if (savedState) {
      if (savedState.formData.email && !formData.email) {
        setFormData(prev => ({
          ...prev,
          email: savedState.formData.email,
          fullName: savedState.formData.fullName || prev.fullName,
          role: savedState.formData.role || prev.role,
        }));
      }
      if (savedState.step === "verify" && step !== "verify") {
        setStep("verify");
      }
      if (savedState.otp && !otp) {
        setOtp(savedState.otp);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save state whenever it changes
  useEffect(() => {
    const state: SignupState = {
      step,
      formData: {
        ...formData,
        password: "", // Don't save password for security
        confirmPassword: "", // Don't save password for security
      },
      otp,
    };
    saveState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData.email, formData.fullName, formData.role, otp]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling on mobile
    
    // Prevent double submission
    if (isLoading) return;
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t.passwordMismatch,
        description: t.passwordMismatchDesc,
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: t.weakPassword,
        description: t.weakPasswordDesc,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    console.log('Registration attempt:', { email: formData.email, apiUrl: import.meta.env.VITE_API_URL }); // Debug log

    try {
      await authService.register({
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password,
        confirm_password: formData.confirmPassword,  // Changed from password_confirm to match backend
        user_type: formData.role,
      });

      console.log('Registration successful'); // Debug log

      toast({
        title: t.registrationSuccessful,
        description: t.registrationSuccessfulDesc,
      });
      
      // Small delay to ensure state is saved before changing step
      await new Promise(resolve => setTimeout(resolve, 100));
      setStep("verify");
    } catch (error: any) {
      console.error('Registration error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      console.error('Error message:', error.message); // Debug log
      
      let errorMessage = t.registrationFailed;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running and accessible.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.email?.[0]) {
        errorMessage = error.response.data.email[0];
      }
      
      toast({
        title: t.registrationFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling on mobile
    
    // Prevent double submission
    if (isLoading) return;
    
    if (otp.length !== 6) {
      toast({
        title: t.invalidOTP,
        description: t.invalidOTPDesc,
        variant: "destructive",
      });
      return;
    }

    // Get email from formData or saved state
    const emailToVerify = formData.email || savedState?.formData?.email;
    
    if (!emailToVerify) {
      toast({
        title: t.verificationFailed,
        description: language === 'en' 
          ? 'Email is required for verification' 
          : 'Barua pepe inahitajika kwa uthibitishaji',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    console.log('OTP verification attempt:', { email: emailToVerify }); // Debug log

    try {
      await authService.verifyRegistration({
        email: emailToVerify,
        otp: otp,
      });

      console.log('OTP verification successful, navigating...'); // Debug log

      // Clear saved state before navigation
      clearSavedState();

      try {
        localStorage.setItem(ACCOUNT_CREATED_KEY, 'true');
      } catch (error) {
        console.error('Failed to save account created state:', error);
      }

      // Use React Router navigation only (no page refresh for low RAM devices)
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate("/dashboard", { replace: true });
      
    } catch (error: any) {
      console.error('OTP verification error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      
      let errorMessage = t.verificationFailedDesc;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running and accessible.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: t.verificationFailed,
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (isLoading) return;
    
    // Get email from formData or saved state
    const emailToResend = formData.email || savedState?.formData?.email;
    
    if (!emailToResend) {
      toast({
        title: t.failedToResendOTP,
        description: language === 'en' ? 'Email is required' : 'Barua pepe inahitajika',
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔵 Resending OTP to:', emailToResend);
      console.log('🔵 Calling authService.resendRegistrationOTP...');
      
      const response = await authService.resendRegistrationOTP(emailToResend);
      
      console.log('🟢 Resend OTP response received:', response);
      console.log('🟢 Response type:', typeof response);
      console.log('🟢 Response keys:', response ? Object.keys(response) : 'null');
      
      // Extract message from response
      // API returns: { message: "OTP resent successfully. Please check your email." }
      const successMessage = response?.message || 
        (language === 'en' 
          ? 'OTP resent successfully. Please check your email.' 
          : 'OTP imetumwa tena kwa mafanikio. Tafadhali angalia barua pepe yako.');
      
      console.log('🟢 Success message:', successMessage);
      
      toast({
        title: t.otpResent || (language === 'en' ? 'OTP Resent' : 'OTP Imetumwa Tena'),
        description: successMessage,
      });
    } catch (error: any) {
      console.error('🔴 Failed to resend OTP:', error);
      console.error('🔴 Error type:', typeof error);
      console.error('🔴 Error name:', error.name);
      console.error('🔴 Error message:', error.message);
      console.error('🔴 Error code:', error.code);
      console.error('🔴 Error response:', error.response);
      console.error('🔴 Error response data:', error.response?.data);
      console.error('🔴 Error status:', error.response?.status);
      console.error('🔴 Error statusText:', error.response?.statusText);
      console.error('🔴 Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = t.failedToResendOTPDesc;
      
      // Try to extract error message from various possible locations
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : error.response.data.error?.message || errorMessage;
      } else if (error.response?.data?.errors) {
        // Handle array of errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors[0];
        } else if (typeof errors === 'object') {
          errorMessage = Object.values(errors)[0] as string || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = language === 'en' 
          ? 'Network error. Please check your internet connection.' 
          : 'Hitilafu ya mtandao. Tafadhali angalia muunganisho wako wa intaneti.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = language === 'en' 
          ? 'Request timeout. Please try again.' 
          : 'Muda umeisha. Tafadhali jaribu tena.';
      }
      
      toast({
        title: t.failedToResendOTP,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we have saved email but no formData.email, restore from saved state
  useEffect(() => {
    if (savedState && savedState.formData.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: savedState.formData.email,
        fullName: savedState.formData.fullName || prev.fullName,
        role: savedState.formData.role || prev.role,
      }));
      if (savedState.step === "verify") {
        setStep("verify");
      }
    }
  }, []);

  if (step === "verify") {
    // If email is missing, show continue button
    const hasEmail = formData.email || savedState?.formData?.email;
    const displayEmail = formData.email || savedState?.formData?.email || "";

    return (
      <div className="min-h-screen flex items-center justify-center p-5 relative bg-muted/30">
        <div className="absolute top-5 right-5">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "sw" : "en")}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/70 hover:bg-white transition-colors text-[20px] shadow-sm border border-border"
          >
            {language === "en" ? "🇹🇿" : "🇺🇸"}
          </button>
        </div>
        <div className="bg-card w-full max-w-[440px] px-9 pt-9 pb-7 rounded-[24px] shadow-xl animate-in fade-in zoom-in-95 duration-300 border border-border">
          <div className="text-center">
            <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="w-[52px] h-[52px] mx-auto" />
            <h2 className="text-[28px] font-bold mt-[14px]">{t.verifyEmail}</h2>
            <p className="text-muted-foreground text-[15px] mt-1.5">
              {hasEmail ? (
                <>
                  {t.verifyEmailDesc} <span className="font-medium text-foreground">{displayEmail}</span>
                </>
              ) : (
                language === 'en' 
                  ? 'Please enter your verification code to continue' 
                  : 'Tafadhali ingiza nambari ya uthibitishaji ili kuendelea'
              )}
            </p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVerifyOTP(e);
            }} 
            noValidate
            className="mt-[26px] flex flex-col gap-4"
          >
            {!hasEmail && (
              <div className="space-y-1.5">
                <Label htmlFor="verify-email" className="text-[14px] font-semibold block mb-1.5">
                  {language === 'en' ? 'Email Address' : 'Anwani ya Barua Pepe'}
                </Label>
                <Input
                  id="verify-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-[46px] rounded-xl px-3.5 text-base bg-background"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-[14px] font-semibold block mb-1.5">{t.verificationCode}</Label>
              <Input
                id="otp"
                placeholder={t.verificationCodePlaceholder}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-[28px] tracking-widest h-[64px] rounded-xl bg-background font-medium"
                required
                autoFocus
              />
            </div>
            
            <Button
              type="button"
              variant="link"
              className="w-full text-[13.5px] mt-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleResendOTP();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                language === 'en' ? 'Sending...' : 'Inatumwa...'
              ) : (
                t.didntReceiveCode
              )}
            </Button>
            
            <Button
              type="submit"
              variant="hero"
              className="h-[48px] mt-1 text-base rounded-xl"
              disabled={isLoading || otp.length !== 6 || !hasEmail}
            >
              {isLoading ? t.verifying : t.verifyAccount}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="h-[48px] text-base rounded-xl"
              onClick={() => {
                setStep("register");
                clearSavedState();
              }}
            >
              {t.backToRegistration}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative bg-muted/30">
      <div className="absolute top-5 right-5">
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "sw" : "en")}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/70 hover:bg-white transition-colors text-[20px] shadow-sm border border-border"
        >
          {language === "en" ? "🇹🇿" : "🇺🇸"}
        </button>
      </div>
      <div className="bg-card w-full max-w-[440px] px-9 pt-9 pb-7 rounded-[24px] shadow-xl animate-in fade-in zoom-in-95 duration-300 border border-border">
        <div className="text-center">
          <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="w-[52px] h-[52px] mx-auto" />
          <h2 className="text-[28px] font-bold mt-[14px]">{t.createAccount}</h2>
          <p className="text-muted-foreground text-[15px] mt-1.5">{t.createAccountDesc}</p>
        </div>
        <form onSubmit={handleRegister} className="mt-[26px] flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[14px] font-semibold block mb-1.5">{t.fullName}</Label>
            <Input
              id="fullName"
              placeholder={t.fullNamePlaceholder}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="h-[46px] rounded-xl px-3.5 text-base bg-background"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[14px] font-semibold block mb-1.5">{t.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-[46px] rounded-xl px-3.5 text-base bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-semibold block mb-1.5">{t.iAmA}</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value: "student" | "lecturer") =>
                setFormData({ ...formData, role: value })
              }
              className="flex gap-4 sm:gap-6 mt-1 mb-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" className="h-5 w-5" />
                <Label htmlFor="student" className="font-normal cursor-pointer text-[14px]">
                  {t.student}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lecturer" id="lecturer" className="h-5 w-5" />
                <Label htmlFor="lecturer" className="font-normal cursor-pointer text-[14px]">
                  {t.lecturer}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[14px] font-semibold block mb-1.5">{t.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-[46px] rounded-xl px-3.5 text-base bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.password.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-[12.5px] font-medium text-muted-foreground">
                  {language === 'en' ? 'Password requirements:' : 'Mahitaji ya nenosiri:'}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[12px]">
                    {passwordValidation.minLength ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}>
                      {language === 'en' ? 'At least 8 characters' : 'Angalau herufi 8'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {passwordValidation.hasUpperCase ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={passwordValidation.hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                      {language === 'en' ? 'One uppercase letter' : 'Herufi kubwa moja'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {passwordValidation.hasLowerCase ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={passwordValidation.hasLowerCase ? "text-green-600" : "text-muted-foreground"}>
                      {language === 'en' ? 'One lowercase letter' : 'Herufi ndogo moja'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {passwordValidation.hasNumber ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                      {language === 'en' ? 'One number' : 'Nambari moja'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[14px] font-semibold block mb-1.5">{t.confirmPasswordLabel}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-[46px] rounded-xl px-3.5 text-base bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-[12px] mt-1.5">
                {passwordValidation.matches ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      {language === 'en' ? 'Passwords match' : 'Nenosiri linafanana'}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {language === 'en' ? 'Passwords do not match' : 'Nenosiri halifanani'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button type="submit" variant="hero" className="h-[48px] mt-2 text-base rounded-xl" disabled={isLoading}>
            {isLoading ? t.creatingAccount : t.createAccount}
          </Button>

          <p className="text-muted-foreground text-[13.5px] text-center m-0 mt-2">
            {t.alreadyHaveAccount}{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline cursor-pointer">
              {t.signIn}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
