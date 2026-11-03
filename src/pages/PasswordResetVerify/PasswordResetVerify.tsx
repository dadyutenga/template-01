import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import authService from "@/services/authService";

// Storage key for persisting state
const STORAGE_KEY = 'kibegi_password_reset_state';

interface PasswordResetState {
  step: "verify";
  email: string;
  otp: string;
}

const PasswordResetVerify = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load state from localStorage on mount
  const loadSavedState = (): PasswordResetState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved password reset state:', error);
    }
    return null;
  };

  // Save state to localStorage
  const saveState = (state: PasswordResetState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save password reset state:', error);
    }
  };

  // Clear saved state (but keep email and OTP for confirm step)
  const clearSavedState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Don't remove password_reset_email or password_reset_otp - they're needed for confirm step
    } catch (error) {
      console.error('Failed to clear saved password reset state:', error);
    }
  };

  const savedState = loadSavedState();
  const savedEmail = localStorage.getItem('password_reset_email');
  
  const [email] = useState(savedEmail || savedState?.email || '');
  const [otp, setOtp] = useState(savedState?.otp || '');
  const [isLoading, setIsLoading] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (savedState) {
      if (savedState.otp && !otp) {
        setOtp(savedState.otp);
      }
    }
    if (savedEmail && !email) {
      // Email is already set from useState initial value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save state whenever it changes
  useEffect(() => {
    if (email && otp) {
      saveState({ step: 'verify', email, otp });
    }
  }, [email, otp]);

  // Redirect if no email
  useEffect(() => {
    if (!email && !savedEmail) {
      toast({
        title: language === 'en' ? 'Email Required' : 'Barua Pepe Inahitajika',
        description: language === 'en'
          ? 'Please request a password reset first'
          : 'Tafadhali omba kuweka upya nywila kwanza',
        variant: "destructive",
      });
      navigate('/password-reset');
    }
  }, [email, savedEmail, navigate, toast, language]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (otp.length !== 6) {
      toast({
        title: t.invalidOTP,
        description: t.invalidOTPDesc,
        variant: "destructive",
      });
      return;
    }

    const emailToVerify = email || savedEmail;
    
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

    try {
      console.log('🔵 Verifying password reset OTP:', { email: emailToVerify, otpLength: otp.length });
      
      const verifyResponse = await authService.verifyPasswordResetOTP({
        email: emailToVerify,
        otp: otp,
      });

      console.log('🟢 Password reset OTP verification successful');
      console.log('🟢 Verify response:', verifyResponse);
      console.log('🟢 Verify response type:', typeof verifyResponse);
      console.log('🟢 Verify response keys:', verifyResponse ? Object.keys(verifyResponse) : 'null');

      // Check if API returns a token (some APIs return a token after verification)
      // Response structure: { success: true, message: "OTP verified", data: { token: "..." }, errors: null }
      console.log('🔵 Full verify response:', JSON.stringify(verifyResponse, null, 2));
      
      // Extract token from verifyResponse.data.data.token (nested structure)
      let token = null;
      if (verifyResponse?.data?.data?.token) {
        token = verifyResponse.data.data.token;
        console.log('✅ Found token in verifyResponse.data.data.token');
      } else if (verifyResponse?.data?.token) {
        token = verifyResponse.data.token;
        console.log('✅ Found token in verifyResponse.data.token');
      } else if (verifyResponse?.token) {
        token = verifyResponse.token;
        console.log('✅ Found token in verifyResponse.token');
      } else if (verifyResponse?.data?.data?.reset_token) {
        token = verifyResponse.data.data.reset_token;
        console.log('✅ Found reset_token in verifyResponse.data.data.reset_token');
      } else if (verifyResponse?.data?.reset_token) {
        token = verifyResponse.data.reset_token;
        console.log('✅ Found reset_token in verifyResponse.data.reset_token');
      }
      
      // If still no token, the OTP itself might be used as the token
      if (!token) {
        console.log('⚠️ No token found in response, will use OTP value as token');
      } else {
        console.log('🔵 Extracted token:', { 
          hasToken: true, 
          tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 4)}` : null,
          tokenLength: token?.length
        });
      }
      
      // Save email, OTP, and token (if provided) for the confirm step
      // IMPORTANT: Save these BEFORE clearing state
      localStorage.setItem('password_reset_email', emailToVerify);
      localStorage.setItem('password_reset_otp', otp);
      if (token) {
        localStorage.setItem('password_reset_token', token);
        console.log('✅ Token saved for confirm step');
      } else {
        // If no token, we'll use OTP as token (some APIs use OTP as token)
        console.log('⚠️ No token in response, will use OTP as token');
      }
      localStorage.setItem('password_reset_verified', 'true');
      
      // Clear only the form state (STORAGE_KEY), but keep email and OTP
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear saved state:', error);
      }
      
      console.log('✅ Saved for confirm step:', { 
        email: emailToVerify, 
        hasOtp: !!otp,
        verified: 'true' 
      });

      toast({
        title: language === 'en' ? 'Code Verified' : 'Msimbo Umehakikiwa',
        description: language === 'en'
          ? 'Please set your new password'
          : 'Tafadhali weka nywila yako mpya',
      });

      // Small delay to ensure localStorage is saved and state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to confirm password step
      console.log('🔄 Navigating to password reset confirm page...');
      navigate('/password-reset/confirm', { replace: true });
    } catch (error: any) {
      console.error('🔴 Password reset OTP verification failed:', error);
      
      let errorMessage = t.verificationFailedDesc || (language === 'en'
        ? 'Invalid verification code. Please try again.'
        : 'Msimbo wa uthibitisho si sahihi. Tafadhali jaribu tena.');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t.verificationFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (isLoading) return;
    
    const emailToResend = email || savedEmail;
    
    if (!emailToResend) {
      toast({
        title: language === 'en' ? 'Email Required' : 'Barua Pepe Inahitajika',
        description: language === 'en'
          ? 'Please enter your email address'
          : 'Tafadhali ingiza anwani yako ya barua pepe',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔵 Resending password reset OTP to:', emailToResend);
      await authService.resendPasswordResetOTP(emailToResend);
      
      console.log('🟢 Password reset OTP resent successfully');
      
      toast({
        title: t.otpResent || (language === 'en' ? 'Code Resent' : 'Msimbo Umetumwa Tena'),
        description: t.otpResentDesc || (language === 'en'
          ? 'A new verification code has been sent to your email.'
          : 'Msimbo mpya wa uthibitisho umetumwa kwa barua pepe yako.'),
      });
      
      // Clear OTP input
      setOtp('');
      saveState({ step: 'verify', email: emailToResend, otp: '' });
    } catch (error: any) {
      console.error('🔴 Failed to resend password reset OTP:', error);
      
      let errorMessage = t.failedToResendOTPDesc || (language === 'en'
        ? 'Failed to resend code. Please try again later.'
        : 'Imeshindwa kutuma msimbo tena. Tafadhali jaribu tena baadaye.');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t.failedToResendOTP || (language === 'en' ? 'Resend Failed' : 'Kutuma Tena Kumeshindwa'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasEmail = email || savedEmail;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      
      <Card className="w-full max-w-md relative shadow-xl">
        <CardHeader className="space-y-1.5 text-center py-4 sm:py-5">
          <Link to="/" className="mx-auto">
            <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-10 w-10 sm:h-11 sm:w-11" />
          </Link>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
            {language === 'en' ? 'Verify Reset Code' : 'Hakiki Msimbo'}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {hasEmail 
              ? (language === 'en'
                  ? `Enter the 6-digit code sent to ${email || savedEmail}`
                  : `Weka msimbo wa tarakimu 6 uliotumwa kwa ${email || savedEmail}`)
              : (language === 'en'
                  ? 'Enter the 6-digit verification code'
                  : 'Weka msimbo wa tarakimu 6 wa uthibitisho')
            }
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVerifyOTP(e);
          }} 
          noValidate
        >
          <CardContent className="space-y-3 sm:space-y-4 py-4 sm:py-5">
            {!hasEmail && (
              <div className="space-y-1.5">
                <Label htmlFor="verify-email" className="text-sm sm:text-base">
                  {language === 'en' ? 'Email Address' : 'Anwani ya Barua Pepe'}
                </Label>
                <Input
                  id="verify-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    saveState({ step: 'verify', email: newEmail, otp });
                  }}
                  required
                  className="h-11 sm:h-12 text-base"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-sm sm:text-base">{t.verificationCode}</Label>
              <Input
                id="otp"
                placeholder={t.verificationCodePlaceholder}
                value={otp}
                onChange={(e) => {
                  const newOtp = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(newOtp);
                  saveState({ step: 'verify', email: email || savedEmail || '', otp: newOtp });
                }}
                maxLength={6}
                className="text-center text-2xl sm:text-3xl tracking-widest h-14 sm:h-16"
                required
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="link"
              className="w-full text-xs sm:text-sm"
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
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:gap-4 py-4 sm:py-5">
            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 sm:h-12 text-base"
              disabled={isLoading || otp.length !== 6 || !hasEmail}
            >
              {isLoading 
                ? (language === 'en' ? 'Verifying...' : 'Inahakiki...')
                : (language === 'en' ? 'Verify Code' : 'Hakiki Msimbo')
              }
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 sm:h-12 text-base"
              onClick={() => {
                clearSavedState();
                navigate('/password-reset');
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Back' : 'Rudi'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordResetVerify;

