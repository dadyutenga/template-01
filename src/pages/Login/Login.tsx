import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { authStorage } from "@/lib/authStorage";
import { Eye, EyeOff } from "lucide-react";

const ACCOUNT_CREATED_KEY = "kibegi_account_created";

const Login = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState(() => authStorage.getRememberedEmail());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Load remember me preference from authStorage
    return authStorage.getRememberMe();
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    authStorage.setRememberMe(rememberMe);
    authStorage.setRememberedEmail(email, rememberMe);
  }, [email, rememberMe]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log('🔄 Login: User already authenticated, redirecting to dashboard...');
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling on mobile
    
    // Prevent double submission
    if (isLoading) return;
    
    setIsLoading(true);

    console.log('Login attempt:', { email, apiUrl: import.meta.env.VITE_API_URL }); // Debug log

    try {
      // Persist the intended storage mode before tokens are written
      authStorage.setRememberMe(rememberMe);
      authStorage.setRememberedEmail(email, rememberMe);
      
      const response = await login({ email, password });
      
      console.log('Login successful:', response.data); // Debug log

      try {
        localStorage.setItem(ACCOUNT_CREATED_KEY, "true");
      } catch (storageError) {
        console.error("Failed to save account created state:", storageError);
      }
      
      console.log(rememberMe ? '✅ Remember me enabled - user will stay logged in' : 'ℹ️ Remember me disabled - session will expire when browser closes');
      
      // Refresh user to get latest profile data including full_name
      if (refreshUser) {
        try {
          await refreshUser();
          console.log('✅ User profile refreshed after login');
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh user profile:', refreshError);
          // Continue anyway - user is already logged in
        }
      }
      
      // Get user data for welcome message
      const userData = response.data?.user;
      const displayName = userData?.full_name || userData?.email || email;
      
      toast({
        title: t.loginSuccessful || "Login Successful",
        description: t.loginSuccessfulDesc || `Welcome back, ${displayName}!`,
      });
      
      // Get redirect path
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      console.log('Redirecting to:', from); // Debug log
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to dashboard
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      console.error('Error message:', error.message); // Debug log
      
      let errorMessage = t.loginFailedDesc;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running and accessible.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast({
        title: t.loginFailed,
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

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
          <h2 className="text-[28px] font-bold mt-[14px]">{language === 'en' ? 'Welcome back' : 'Karibu tena'}</h2>
          <p className="text-muted-foreground text-[15px] mt-1.5">{language === 'en' ? 'Sign in to your digital school bag' : 'Ingia kwenye mfuko wako wa shule wa kidijitali'}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-[26px] flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[14px] font-semibold block mb-1.5">{language === 'en' ? 'Email' : 'Barua pepe'}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[46px] rounded-xl px-3.5 text-base bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[14px] font-semibold block mb-1.5">{language === 'en' ? 'Password' : 'Nenosiri'}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="h-4 w-4 rounded"
                />
                <Label
                  htmlFor="remember-me"
                  className="text-[13.5px] font-normal cursor-pointer text-foreground"
                >
                  {t.rememberMe || (language === 'en' ? 'Remember me' : 'Nikumbuke')}
                </Label>
              </div>
              <Link to="/password-reset" className="text-[13px] text-primary hover:underline cursor-pointer font-medium">
                {language === 'en' ? 'Forgot password?' : 'Umesahau?'}
              </Link>
            </div>
          </div>

          <Button type="submit" variant="hero" className="h-[48px] mt-1 text-base rounded-xl" disabled={isLoading}>
            {isLoading ? (language === 'en' ? 'Signing in...' : 'Inaingia...') : (language === 'en' ? 'Sign In' : 'Ingia')}
          </Button>

          <p className="text-muted-foreground text-[13.5px] text-center m-0 mt-2">
            {language === 'en' ? "Don't have an account? " : "Huna akaunti? "}
            <Link to="/signup" className="text-primary font-semibold hover:underline cursor-pointer">
              {language === 'en' ? 'Sign up' : 'Jisajili'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
