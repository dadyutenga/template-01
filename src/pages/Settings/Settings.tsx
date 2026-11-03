import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Globe, Moon, Sun, HardDrive, Info, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import storageService, { StorageInfo } from "@/services/storageService";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // Fetch storage information from API
  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        setIsLoadingStorage(true);
        console.log('🔵 Settings - Fetching storage info');
        const info = await storageService.getStorageInfo();
        console.log('🟢 Settings - Storage info:', info);
        setStorageInfo(info);
      } catch (error: any) {
        console.error("🔴 Failed to fetch storage info:", error);
        toast({
          title: language === 'en' ? "Failed to Load Storage" : "Imeshindwa Kupakua Uhifadhi",
          description: error.response?.data?.message || (language === 'en' 
            ? "Could not fetch your storage information" 
            : "Haikuweza kupakua taarifa za uhifadhi wako"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingStorage(false);
      }
    };

    if (user) {
      fetchStorageInfo();
    }
  }, [user, language]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatMB = (mb: number): string => {
    if (mb === 0) return "0 MB";
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const storagePercentage = storageInfo ? storageInfo.usage_percentage : 0;
  const storageUsed = storageInfo ? storageInfo.used_storage_bytes : 0;
  const storageLimit = storageInfo ? storageInfo.total_quota_mb * 1024 * 1024 : 0;

  // Get app version from package.json (will be set at build time or use default)
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

  const userRole = user?.user_type === 'lecturer' ? 'lecturer' : 'student';
  const userName = user?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        userRole={userRole}
        userName={userName}
        hideGlobalSearch={true}
      />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {language === 'en' ? 'Settings' : 'Mipangilio'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your account settings and preferences' 
              : 'Simamia mipangilio ya akaunti yako na mapendeleo'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {language === 'en' ? 'Language Settings' : 'Mipangilio ya Lugha'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Choose your preferred language' 
                  : 'Chagua lugha unayopendelea'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:bg-muted ${
                    language === 'en' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🇬🇧</div>
                    <div className="text-left">
                      <p className="font-semibold">English</p>
                      <p className="text-sm text-muted-foreground">English</p>
                    </div>
                  </div>
                  {language === 'en' && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setLanguage('sw')}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:bg-muted ${
                    language === 'sw' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🇹🇿</div>
                    <div className="text-left">
                      <p className="font-semibold">Swahili</p>
                      <p className="text-sm text-muted-foreground">Kiswahili</p>
                    </div>
                  </div>
                  {language === 'sw' && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Dark Mode Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'light' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                {language === 'en' ? 'Appearance' : 'Muonekano'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Toggle between light and dark mode' 
                  : 'Badilisha kati ya hali ya mwanga na giza'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-base">
                    {language === 'en' ? 'Dark Mode' : 'Hali ya Giza'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Switch to dark theme' 
                      : 'Badilisha kwa mandhari ya giza'}
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Storage */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/storage')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  {language === 'en' ? 'Storage' : 'Uhifadhi'}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'View your storage usage and details' 
                  : 'Angalia matumizi yako ya uhifadhi na maelezo'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStorage ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : storageInfo ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Storage Used' : 'Imetumika'}
                      </span>
                      <span className="font-semibold">
                        {formatMB(storageInfo.used_storage_mb)} / {formatMB(storageInfo.total_quota_mb)}
                      </span>
                    </div>
                    <Progress 
                      value={storagePercentage} 
                      className={`h-2 ${
                        storageInfo.is_near_limit || storageInfo.is_full 
                          ? 'bg-destructive' 
                          : ''
                      }`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {storagePercentage.toFixed(1)}% {language === 'en' ? 'used' : 'imetumika'}
                    </p>
                    {storageInfo.is_near_limit && !storageInfo.is_full && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 text-right">
                        ⚠️ {language === 'en' ? 'Running low on storage' : 'Uhifadhi unakaribia kuisha'}
                      </p>
                    )}
                    {storageInfo.is_full && (
                      <p className="text-xs text-destructive text-right">
                        {language === 'en' ? 'Storage is full' : 'Uhifadhi umejaa'}
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {language === 'en' ? 'Used' : 'Imetumika'}
                      </p>
                      <p className="font-semibold text-lg">{formatMB(storageInfo.used_storage_mb)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {language === 'en' ? 'Available' : 'Inapatikana'}
                      </p>
                      <p className="font-semibold text-lg">{formatMB(storageInfo.free_storage_mb)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/storage');
                    }}
                  >
                    {language === 'en' ? 'View Details' : 'Angalia Maelezo'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {language === 'en' ? 'No storage information available' : 'Hakuna taarifa za uhifadhi zinazopatikana'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Version Footer */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  {language === 'en' ? 'App Version' : 'Toleo la Programu'}: {appVersion}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;




