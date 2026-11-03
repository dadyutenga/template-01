import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HardDrive, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import storageService, { StorageData, StorageInfo, StorageUsageHistory } from "@/services/storageService";
import { toast } from "@/hooks/use-toast";

const Storage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = language === 'en' ? {
    pageTitle: "Storage Management",
    pageDescription: "View and manage your storage usage",
    storageOverview: "Storage Overview",
    totalQuota: "Total Quota",
    usedStorage: "Used Storage",
    freeStorage: "Free Storage",
    usagePercentage: "Usage",
    recalculate: "Recalculate",
    recalculating: "Recalculating...",
    lastCalculated: "Last Calculated",
    storageDetails: "Storage Details",
    usageHistory: "Usage History",
    noHistory: "No usage history available",
    isFull: "Storage is full",
    nearLimit: "Running low on storage space",
    recalculateSuccess: "Storage recalculated successfully",
    recalculateFailed: "Failed to recalculate storage",
    loadFailed: "Failed to load storage information",
    bytes: "Bytes",
    mb: "MB",
    gb: "GB",
    available: "Available",
    used: "Used",
    viewDetails: "View Details",
    back: "Back"
  } : {
    pageTitle: "Usimamizi wa Uhifadhi",
    pageDescription: "Angalia na simamia matumizi yako ya uhifadhi",
    storageOverview: "Muhtasari wa Uhifadhi",
    totalQuota: "Kikomo cha Jumla",
    usedStorage: "Uhifadhi Uliotumika",
    freeStorage: "Uhifadhi Unaopatikana",
    usagePercentage: "Asilimia ya Matumizi",
    recalculate: "Hesabu Upya",
    recalculating: "Inahesabu upya...",
    lastCalculated: "Imehesabiwa Mwisho",
    storageDetails: "Maelezo ya Uhifadhi",
    usageHistory: "Historia ya Matumizi",
    noHistory: "Hakuna historia ya matumizi inayopatikana",
    isFull: "Uhifadhi umejaa",
    nearLimit: "Uhifadhi unakaribia kuisha",
    recalculateSuccess: "Uhifadhi umehesabiwa upya kwa mafanikio",
    recalculateFailed: "Imeshindwa kuhesabu upya uhifadhi",
    loadFailed: "Imeshindwa kupakua taarifa za uhifadhi",
    bytes: "Baiti",
    mb: "MB",
    gb: "GB",
    available: "Inapatikana",
    used: "Imetumika",
    viewDetails: "Angalia Maelezo",
    back: "Rudi"
  };

  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [usageHistory, setUsageHistory] = useState<StorageUsageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchStorageData();
  }, [user, navigate]);

  const fetchStorageData = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Storage page - Fetching storage data');
      const [data, info, history] = await Promise.all([
        storageService.getStorage(),
        storageService.getStorageInfo(),
        storageService.getUsageHistory(30)
      ]);
      
      console.log('🟢 Storage page - Data:', data);
      console.log('🟢 Storage page - Info:', info);
      console.log('🟢 Storage page - History:', history);
      
      setStorageData(data);
      setStorageInfo(info);
      setUsageHistory(history);
    } catch (error: any) {
      console.error('🔴 Failed to fetch storage data:', error);
      toast({
        title: t.loadFailed,
        description: error.response?.data?.message || error.message || "Could not load storage information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      console.log('🔵 Recalculating storage');
      const info = await storageService.recalculateStorage();
      setStorageInfo(info);
      
      // Update storageData with new values
      if (storageData) {
        setStorageData({
          ...storageData,
          used_storage_bytes: info.used_storage_bytes,
          used_storage_mb: info.used_storage_mb,
          free_storage_mb: info.free_storage_mb,
          free_storage_bytes: info.free_storage_bytes,
          usage_percentage: info.usage_percentage,
          is_full: info.is_full,
          is_near_limit: info.is_near_limit,
          last_calculated: info.last_calculated,
          updated_at: new Date().toISOString(),
        });
      }
      
      toast({
        title: t.recalculateSuccess,
        description: language === 'en' 
          ? "Your storage has been recalculated" 
          : "Uhifadhi wako umehesabiwa upya",
      });
    } catch (error: any) {
      console.error('🔴 Failed to recalculate storage:', error);
      toast({
        title: t.recalculateFailed,
        description: error.response?.data?.message || error.message || "Could not recalculate storage",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return `0 ${t.bytes}`;
    if (bytes < 1024) return `${bytes} ${t.bytes}`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} ${t.mb}`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ${t.gb}`;
  };

  const formatMB = (mb: number): string => {
    if (mb === 0) return `0 ${t.mb}`;
    if (mb < 1024) return `${mb.toFixed(2)} ${t.mb}`;
    return `${(mb / 1024).toFixed(2)} ${t.gb}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <DashboardNav
          userRole={user?.user_type || "student"}
          userName={user?.full_name || user?.email || ""}
          hideGlobalSearch={true}
        />
        <main className="container py-4 md:py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!storageData || !storageInfo) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <DashboardNav
          userRole={user?.user_type || "student"}
          userName={user?.full_name || user?.email || ""}
          hideGlobalSearch={true}
        />
        <main className="container py-4 md:py-8 px-4">
          <Alert>
            <AlertDescription>
              {t.loadFailed}
            </AlertDescription>
          </Alert>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={user?.user_type || "student"}
        userName={user?.full_name || user?.email || ""}
        hideGlobalSearch={true}
      />

      <main className="container py-4 md:py-8 px-4">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary w-fit underline-offset-4 hover:underline"
            >
              {t.back}
            </button>

            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 text-primary">
                <HardDrive className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {t.pageTitle}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                  {t.pageDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Storage Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.storageOverview}</CardTitle>
                  <CardDescription>
                    {language === 'en' 
                      ? 'Your current storage usage and quota' 
                      : 'Matumizi yako ya sasa ya uhifadhi na kikomo'}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                >
                  {isRecalculating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isRecalculating ? t.recalculating : t.recalculate}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.usagePercentage}</span>
                  <span className="font-semibold">
                    {storageInfo.usage_percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={storageInfo.usage_percentage} 
                  className={`h-3 ${
                    storageInfo.is_full 
                      ? 'bg-destructive' 
                      : storageInfo.is_near_limit 
                        ? 'bg-yellow-500' 
                        : ''
                  }`}
                />
                {storageInfo.is_full && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{t.isFull}</AlertDescription>
                  </Alert>
                )}
                {storageInfo.is_near_limit && !storageInfo.is_full && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                      {t.nearLimit}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Storage Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t.totalQuota}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatMB(storageInfo.total_quota_mb)}
                        </p>
                      </div>
                      <HardDrive className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t.usedStorage}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatMB(storageInfo.used_storage_mb)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(storageInfo.used_storage_bytes)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t.freeStorage}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatMB(storageInfo.free_storage_mb)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(storageInfo.free_storage_bytes)}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Storage Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.storageDetails}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'User' : 'Mtumiaji'}
                    </span>
                    <span className="font-medium">{storageData.user_full_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Email' : 'Barua Pepe'}
                    </span>
                    <span className="font-medium truncate ml-2">{storageData.user_email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-muted-foreground">{t.lastCalculated}</span>
                    <span className="font-medium">
                      {formatDate(storageInfo.last_calculated)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Status' : 'Hali'}
                    </span>
                    <Badge variant={storageInfo.is_full ? "destructive" : storageInfo.is_near_limit ? "default" : "secondary"}>
                      {storageInfo.is_full 
                        ? (language === 'en' ? 'Full' : 'Imejaa')
                        : storageInfo.is_near_limit
                          ? (language === 'en' ? 'Near Limit' : 'Karibu Kikomo')
                          : (language === 'en' ? 'Normal' : 'Kawaida')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage History */}
          {usageHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.usageHistory}
                </CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? 'Historical storage usage snapshots' 
                    : 'Picha za zamani za matumizi ya uhifadhi'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usageHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{formatMB(history.used_storage_mb)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(history.recorded_at)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(history.used_storage_bytes)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {language === 'en' 
                ? 'Storage is automatically updated when you upload or delete files. You can manually recalculate if needed.'
                : 'Uhifadhi husasishwa kiotomatiki unapopakia au kufuta faili. Unaweza kuhesabu upya mwenyewe ikiwa ni lazima.'}
            </AlertDescription>
          </Alert>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Storage;

