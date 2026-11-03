import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import authService from "@/services/authService";

const PasswordResetRequest = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (!email || !email.trim()) {
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
      console.log('🔵 Requesting password reset for:', email);
      await authService.requestPasswordReset({ email: email.trim() });
      
      console.log('🟢 Password reset request successful');
      
      // Save email to localStorage for the verify step
      localStorage.setItem('password_reset_email', email.trim());
      
      toast({
        title: language === 'en' ? 'Reset Code Sent' : 'Msimbo Umetumwa',
        description: language === 'en'
          ? 'Please check your email for the verification code.'
          : 'Tafadhali angalia barua pepe yako kwa msimbo wa uthibitisho.',
      });
      
      // Navigate to verify step
      navigate('/password-reset/verify');
    } catch (error: any) {
      console.error('🔴 Password reset request failed:', error);
      
      let errorMessage = language === 'en'
        ? 'Failed to send reset code. Please try again.'
        : 'Imeshindwa kutuma msimbo. Tafadhali jaribu tena.';
      
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
        title: language === 'en' ? 'Request Failed' : 'Ombi Limeshindwa',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      
      <Card className="w-full max-w-md relative shadow-xl">
        <CardHeader className="space-y-1.5 text-center py-4 sm:py-5">
          <Link to="/" className="mx-auto">
            <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-10 w-10 sm:h-11 sm:w-11" />
          </Link>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
            {language === 'en' ? 'Reset Password' : 'Weka Upya Nywila'}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {language === 'en'
              ? 'Enter your email to receive a verification code'
              : 'Ingiza barua pepe yako kupokea msimbo wa uthibitisho'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-3 sm:space-y-4 py-4 sm:py-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm sm:text-base">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 sm:h-12 text-base"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:gap-4 py-4 sm:py-5">
            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 sm:h-12 text-base"
              disabled={isLoading}
            >
              {isLoading 
                ? (language === 'en' ? 'Sending...' : 'Inatumwa...')
                : (language === 'en' ? 'Send Reset Code' : 'Tuma Msimbo')
              }
            </Button>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full h-11 sm:h-12 text-base">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Back to Login' : 'Rudi kwa Kuingia'}
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordResetRequest;

