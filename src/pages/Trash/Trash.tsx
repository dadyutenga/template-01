import { useState, useEffect } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, RotateCcw, FileText, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import fileService, { FileData } from "@/services/fileService";

export default function Trash() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [deletedFiles, setDeletedFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Restore dialog
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [fileToRestore, setFileToRestore] = useState<FileData | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
    fetchDeletedFiles();
    }
  }, [user]);

  const fetchDeletedFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fileService.getDeletedFiles();
      const files = Array.isArray(response.data) ? response.data : [];
      setDeletedFiles(files);
    } catch (error: any) {
      console.error('Failed to fetch deleted files:', error);
      toast({
        title: t("trashLoadFailedTitle"),
        description: error.response?.data?.message || t("trashLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRestoreDialog = (file: FileData) => {
    setFileToRestore(file);
    setRestoreDialogOpen(true);
  };

  const openDeleteDialog = (file: FileData) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleRestore = async () => {
    if (!fileToRestore) return;

    setIsRestoring(true);
    try {
      await fileService.restoreFile(fileToRestore.file_code);

      toast({
        title: t("trashRestoreSuccessTitle"),
        description: t("trashRestoreSuccessDesc").replace("{fileName}", fileToRestore.file_name),
      });

      setRestoreDialogOpen(false);
      setFileToRestore(null);
      await fetchDeletedFiles();
    } catch (error: any) {
      console.error('Restore failed:', error);
      toast({
        title: t("trashRestoreFailedTitle"),
        description: error.response?.data?.message || t("trashRestoreFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      await fileService.permanentDeleteFile(fileToDelete.file_code);

      toast({
        title: t("trashDeleteSuccessTitle"),
        description: t("trashDeleteSuccessDesc").replace("{fileName}", fileToDelete.file_name),
      });

      setDeleteDialogOpen(false);
      setFileToDelete(null);
      await fetchDeletedFiles();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: t("trashDeleteFailedTitle"),
        description: error.response?.data?.message || t("trashDeleteFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDaysUntilDeletion = (file: FileData) => {
    if (file.days_until_permanent_deletion !== undefined) {
      return file.days_until_permanent_deletion;
    }
    if (!file.deleted_at) return 21;
    const deleted = new Date(file.deleted_at);
    const now = new Date();
    const diffTime = 21 * 24 * 60 * 60 * 1000 - (now.getTime() - deleted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const expiringFiles = deletedFiles.filter(f => getDaysUntilDeletion(f) <= 7);

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav userRole={user?.user_type || "student"} userName={user?.full_name || user?.email || "User"} />
      
      <main className="container max-w-7xl mx-auto py-3 md:py-8 px-3 sm:px-4">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
            <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{t("trashPageTitle")}</h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2">
            {t("trashPageDescription")}
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-3">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex gap-1 sm:gap-2 p-1">
            <TabsTrigger value="all" className="text-sm py-2 sm:py-2.5 px-2 whitespace-nowrap">
              <span className="truncate">{t("trashTabAll")}</span>
              {deletedFiles.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-1.5 text-[9px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">{deletedFiles.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expiring" className="text-sm py-2 sm:py-2.5 px-2 whitespace-nowrap">
              <span className="truncate">{t("trashTabExpiring")}</span>
              {expiringFiles.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-1.5 text-[9px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
                  {expiringFiles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            <Card>
              <CardHeader className="pb-2 sm:pb-3 md:pb-6 pt-3 sm:pt-6 px-3 sm:px-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">{t("trashDeletedFilesTitle")}</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                  {t("trashDeletedFilesDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : deletedFiles.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Trash2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{t("trashEmptyTitle")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground px-4">
                      {t("trashEmptyDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 sm:gap-4">
                    {deletedFiles.map((file) => {
                      const daysLeft = getDaysUntilDeletion(file);
                      const isExpiring = daysLeft <= 7;
                      
                      return (
                        <Card key={file.id} className="hover:shadow-md transition-shadow w-full overflow-hidden">
                          <CardContent className="p-2.5 sm:p-3 md:p-4">
                            <div className="flex flex-col gap-2 sm:gap-3 w-full">
                              {/* File icon and info */}
                              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </div>
                                
                                <div className="flex-1 min-w-0 overflow-hidden pr-1">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">{file.file_name}</h3>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <Badge variant={file.source === "upload" ? "default" : "secondary"} className="text-[10px] sm:text-xs h-5 px-2">
                                      {file.source === "upload" ? t("trashSourceUpload") : t("trashSourceShared")}
                                    </Badge>
                                    <span>•</span>
                                    <span>{formatFileSize(file.file_size)}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {file.source === 'upload' ? file.owner.full_name : file.shared_by?.full_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {t("trashDeletedLabel")} {file.deleted_at && formatDate(file.deleted_at)}
                                    {isExpiring && (
                                      <>
                                        {' • '}
                                        <span className="text-destructive font-medium">
                                          {daysLeft === 1 ? t("trashDayLeft").replace("{count}", String(daysLeft)) : t("trashDaysLeft").replace("{count}", String(daysLeft))}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            
                              {/* Action buttons */}
                              <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRestoreDialog(file)}
                                  className="h-10 w-full text-xs px-2 sm:px-3"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                                  <span>{t("trashRestoreButton")}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(file)}
                                  className="h-10 w-full text-xs px-2 sm:px-3"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                                  <span>{t("trashDeleteForeverButton")}</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-3">
            <Card>
              <CardHeader className="pb-2 sm:pb-3 md:pb-6 pt-3 sm:pt-6 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-destructive flex-shrink-0" />
                  <span className="truncate">{t("trashExpiringTitle")}</span>
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                  {t("trashExpiringDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : expiringFiles.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{t("trashExpiringEmptyTitle")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground px-4">
                      {t("trashExpiringEmptyDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 sm:gap-4">
                    {expiringFiles.map((file) => {
                      const daysLeft = getDaysUntilDeletion(file);
                        
                        return (
                        <Card key={file.id} className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:shadow-md transition-shadow w-full overflow-hidden">
                          <CardContent className="p-2.5 sm:p-3 md:p-4">
                            <div className="flex flex-col gap-2 sm:gap-3 w-full">
                              {/* File icon and info */}
                              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </div>
                                
                                <div className="flex-1 min-w-0 overflow-hidden pr-1">
                                  <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate leading-tight">{file.file_name}</h3>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
                                    <Badge variant={file.source === "upload" ? "default" : "secondary"} className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 sm:px-2">
                                      {file.source === "upload" ? t("trashSourceUpload") : t("trashSourceShared")}
                                    </Badge>
                                    <span className="text-[10px]">•</span>
                                    <span className="text-[10px] sm:text-xs">{formatFileSize(file.file_size)}</span>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                                    {file.source === 'upload' ? file.owner.full_name : file.shared_by?.full_name}
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                                    {t("trashDeletedLabel")} {file.deleted_at && formatDate(file.deleted_at)}
                                    {' • '}
                                    <span className="text-destructive font-medium">
                                      {daysLeft === 1 ? t("trashDayLeftUrgent").replace("{count}", String(daysLeft)) : t("trashDaysLeftUrgent").replace("{count}", String(daysLeft))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRestoreDialog(file)}
                                  className="h-10 w-full text-xs px-2 sm:px-3 min-w-0"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 flex-shrink-0" />
                                  <span className="truncate">{t("trashRestoreButton")}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(file)}
                                  className="h-10 w-full text-xs px-2 sm:px-3 min-w-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 flex-shrink-0" />
                                  <span className="truncate">{t("trashDeleteForeverButton")}</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              {t("trashRestoreDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("trashRestoreDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{fileToRestore?.file_name}</span>
            </div>
            <div className="text-muted-foreground space-y-1">
              <div>{t("filesCode")}: <code className="bg-muted px-1 py-0.5 rounded text-xs">{fileToRestore?.file_code}</code></div>
              <div>{t("filesSize")}: {fileToRestore && formatFileSize(fileToRestore.file_size)}</div>
              {fileToRestore && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 mt-2">
                  <AlertCircle className="h-3 w-3" />
                  <span>{getDaysUntilDeletion(fileToRestore) === 1 ? t("trashRestoreDialogDaysLeft").replace("{count}", String(getDaysUntilDeletion(fileToRestore))) : t("trashRestoreDialogDaysLeftPlural").replace("{count}", String(getDaysUntilDeletion(fileToRestore)))}</span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="grid grid-cols-1 gap-2 sm:flex">
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={isRestoring} className="h-10 w-full sm:w-auto">
              {t("cancel")}
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring} className="h-10 w-full sm:w-auto">
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("trashRestoring")}
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("trashRestoreButton")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("trashDeleteDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("trashDeleteDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-destructive" />
              <span className="font-medium">{fileToDelete?.file_name}</span>
            </div>
            <div className="text-muted-foreground space-y-1">
              <div>{t("filesCode")}: <code className="bg-muted px-1 py-0.5 rounded text-xs">{fileToDelete?.file_code}</code></div>
              <div>{t("filesSize")}: {fileToDelete && formatFileSize(fileToDelete.file_size)}</div>
            </div>
            <div className="flex items-center gap-2 text-destructive font-medium pt-2 border-t border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <span>{t("trashDeleteDialogWarning")}</span>
            </div>
          </div>
          
          <DialogFooter className="grid grid-cols-1 gap-2 sm:flex">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} className="h-10 w-full sm:w-auto">
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete} disabled={isDeleting} className="h-10 w-full sm:w-auto">
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("trashDeleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("trashDeleteForeverButton")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
