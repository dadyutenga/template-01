import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import authService from "@/services/authService";

const PasswordResetConfirm = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has verified OTP
    const verified = localStorage.getItem('password_reset_verified');
    const savedEmail = localStorage.getItem('password_reset_email');
    const savedOtp = localStorage.getItem('password_reset_otp');
    const savedToken = localStorage.getItem('password_reset_token');
    
    console.log('🔵 PasswordResetConfirm - Checking state:', {
      verified,
      hasEmail: !!savedEmail,
      hasOtp: !!savedOtp,
      hasToken: !!savedToken,
      email: savedEmail
    });
    
    if (!verified || verified !== 'true') {
      console.log('⚠️ Not verified, redirecting to verify page');
      toast({
        title: language === 'en' ? 'Verification Required' : 'Uthibitisho Unahitajika',
        description: language === 'en'
          ? 'Please verify your email first'
          : 'Tafadhali thibitisha barua pepe yako kwanza',
        variant: "destructive",
      });
      navigate('/password-reset/verify');
      return;
    }
    
    if (!savedEmail) {
      console.log('⚠️ Missing email, redirecting to verify page');
      toast({
        title: language === 'en' ? 'Missing Information' : 'Taarifa Zinakosekana',
        description: language === 'en'
          ? 'Please complete the verification step first'
          : 'Tafadhali maliza hatua ya uthibitishaji kwanza',
        variant: "destructive",
      });
      navigate('/password-reset/verify');
      return;
    }
    
    console.log('✅ All data present, setting state');
    setEmail(savedEmail);
    if (savedOtp) setOtp(savedOtp);
    if (savedToken) setToken(savedToken);
  }, [navigate, toast, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Form submit triggered', {
      isLoading,
      passwordLength: password.length,
      passwordsMatch: password === confirmPassword,
      hasEmail: !!email,
      hasToken: !!token,
      hasOtp: !!otp
    });
    
    if (isLoading) {
      console.log('⚠️ Already loading, ignoring');
      return;
    }
    
    // Validation
    if (password.length < 8) {
      toast({
        title: t.weakPassword || (language === 'en' ? 'Weak Password' : 'Nywila Dhaifu'),
        description: t.weakPasswordDesc || (language === 'en'
          ? 'Password must be at least 8 characters long.'
          : 'Nywila lazima iwe na angalau herufi 8.'),
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: t.passwordMismatch || (language === 'en' ? 'Passwords Do Not Match' : 'Nywila Hazilingani'),
        description: t.passwordMismatchDesc || (language === 'en'
          ? 'Passwords do not match. Please try again.'
          : 'Nywila hazilingani. Tafadhali jaribu tena.'),
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: language === 'en' ? 'Missing Information' : 'Taarifa Zinakosekana',
        description: language === 'en'
          ? 'Email is required for password reset'
          : 'Barua pepe inahitajika kwa kuweka upya nywila',
        variant: "destructive",
      });
      navigate('/password-reset/verify');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 Confirming password reset:', { 
        email, 
        hasToken: !!token,
        hasOtp: !!otp,
        passwordLength: password.length
      });
      
      // Build request data - API requires: token, new_password, confirm_password (NO email, NO otp)
      // The token should be the OTP value (or actual token if API returned one)
      const tokenToUse = token || otp;
      
      if (!tokenToUse) {
        toast({
          title: language === 'en' ? 'Missing Token' : 'Token Inakosekana',
          description: language === 'en'
            ? 'Token is required for password reset. Please verify your email again.'
            : 'Token inahitajika kwa kuweka upya nywila. Tafadhali thibitisha barua pepe yako tena.',
          variant: "destructive",
        });
        navigate('/password-reset/verify');
        return;
      }
      
      const confirmData = {
        token: tokenToUse, // API requires token (use OTP value as token)
        new_password: password,
        confirm_password: confirmPassword, // API requires confirm_password
      };
      
      console.log('✅ Using token for confirmation:', { 
        hasToken: !!token, 
        hasOtp: !!otp,
        tokenLength: tokenToUse.length 
      });
      
      await authService.confirmPasswordReset(confirmData);

      console.log('🟢 Password reset confirmed successfully');

      // Clear all password reset data
      localStorage.removeItem('password_reset_email');
      localStorage.removeItem('password_reset_otp');
      localStorage.removeItem('password_reset_token');
      localStorage.removeItem('password_reset_verified');
      localStorage.removeItem('kibegi_password_reset_state');

      setIsSuccess(true);
      
      toast({
        title: language === 'en' ? 'Password Reset Successful' : 'Nywila Imewekwa Upya',
        description: language === 'en'
          ? 'Your password has been reset successfully. Please login with your new password.'
          : 'Nywila yako imewekwa upya kwa mafanikio. Tafadhali ingia kwa nywila yako mpya.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('🔴 Password reset confirmation failed:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        requestData: error.config?.data
      });
      
      let errorMessage = language === 'en'
        ? 'Failed to reset password. Please try again.'
        : 'Imeshindwa kuweka upya nywila. Tafadhali jaribu tena.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error?.message || errorMessage;
        } else if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData.errors === 'object') {
            const errorMessages = Object.entries(errorData.errors).map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            });
            errorMessage = errorMessages.join('; ');
          }
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: language === 'en' ? 'Reset Failed' : 'Kuweka Upya Kumeshindwa',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        
        <Card className="w-full max-w-md relative shadow-xl">
          <CardHeader className="space-y-1.5 text-center py-4 sm:py-5">
            <div className="mx-auto rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
              {language === 'en' ? 'Password Reset Successful' : 'Nywila Imewekwa Upya'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {language === 'en'
                ? 'Your password has been reset successfully. Redirecting to login...'
                : 'Nywila yako imewekwa upya kwa mafanikio. Inaelekeza kwa kuingia...'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center py-4 sm:py-5">
            <Link to="/login" className="w-full">
              <Button variant="hero" className="w-full h-11 sm:h-12 text-base">
                {language === 'en' ? 'Go to Login' : 'Nenda Kwa Kuingia'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      
      <Card className="w-full max-w-md relative shadow-xl">
        <CardHeader className="space-y-1.5 text-center py-4 sm:py-5">
          <Link to="/" className="mx-auto">
            <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-10 w-10 sm:h-11 sm:w-11" />
          </Link>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
            {language === 'en' ? 'Set New Password' : 'Weka Nywila Mpya'}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {language === 'en'
              ? 'Enter your new password below'
              : 'Ingiza nywila yako mpya hapa chini'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-3 sm:space-y-4 py-4 sm:py-5">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm sm:text-base">{t.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 sm:h-12 text-base"
                autoFocus
              />
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t.passwordMinimum}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base">{t.confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t.passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 sm:h-12 text-base"
              />
            </div>
            {(password.length > 0 && password.length < 8) && (
              <p className="text-xs sm:text-sm text-destructive mt-1">
                {language === 'en' 
                  ? 'Password must be at least 8 characters'
                  : 'Nywila lazima iwe na angalau herufi 8'}
              </p>
            )}
            {(password.length >= 8 && password !== confirmPassword && confirmPassword.length > 0) && (
              <p className="text-xs sm:text-sm text-destructive mt-1">
                {language === 'en' 
                  ? 'Passwords do not match'
                  : 'Nywila hazilingani'}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:gap-4 py-4 sm:py-5">
            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 sm:h-12 text-base"
              disabled={isLoading || password.length < 8 || password !== confirmPassword}
            >
              {isLoading 
                ? (language === 'en' ? 'Resetting...' : 'Inaweka upya...')
                : (language === 'en' ? 'Reset Password' : 'Weka Upya Nywila')
              }
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 sm:h-12 text-base"
              onClick={() => navigate('/password-reset/verify')}
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

export default PasswordResetConfirm;

