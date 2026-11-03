import { useState, useEffect } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Share2, Loader2, Check, X, Clock, Download, Eye, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import sharingService, { SharedFileData, SharedFileListItem } from "@/services/sharingService";
import FilePreview from "@/components/FilePreview";
import { FileData } from "@/services/fileService";

const Sharing = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [pendingRequests, setPendingRequests] = useState<SharedFileListItem[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedFileListItem[]>([]);
  const [myShares, setMyShares] = useState<SharedFileListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedShare, setSelectedShare] = useState<SharedFileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewingShareId, setViewingShareId] = useState<string | null>(null);
  
  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllShares();
    }
  }, [user]);

  const fetchAllShares = async () => {
    setIsLoading(true);
    try {
      const [requests, shared, shares] = await Promise.all([
        sharingService.listPendingRequests(),
        sharingService.listSharedWithMe(),
        sharingService.listMyShares(),
      ]);

      setPendingRequests(requests.results || []);
      setSharedWithMe(shared.results || []);
      setMyShares(shares.results || []);
    } catch (error: any) {
      console.error('Failed to fetch shares:', error);
      toast({
        title: t("sharingLoadFailedTitle"),
        description: error.response?.data?.message || t("sharingLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptShare = async (shareId: string, fileName: string) => {
    setIsProcessing(true);
    try {
      await sharingService.acceptShare(shareId);
      
      toast({
        title: t("sharingAcceptSuccessTitle"),
        description: t("sharingAcceptSuccessDesc"),
      });

      // Refresh data
      await fetchAllShares();
      setSelectedShare(null);
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Failed to accept share:', error);
      toast({
        title: t("sharingAcceptFailedTitle"),
        description: error.response?.data?.message || t("sharingAcceptFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectShare = async (shareId: string, fileName: string) => {
    setIsProcessing(true);
    try {
      await sharingService.rejectShare(shareId);
      
      toast({
        title: t("sharingRejectSuccessTitle"),
        description: t("sharingRejectSuccessDesc"),
      });

      // Refresh data
      await fetchAllShares();
      setSelectedShare(null);
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Failed to reject share:', error);
      toast({
        title: t("sharingRejectFailedTitle"),
        description: error.response?.data?.message || t("sharingRejectFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewShare = async (shareId: string) => {
    setViewingShareId(shareId);
    setSelectedShare(null);
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const shareDetails = await sharingService.getShareDetails(shareId);
      setSelectedShare(shareDetails);
    } catch (error: any) {
      console.error('Failed to load share details:', error);
      toast({
        title: t("sharingViewFailedTitle"),
        description: error.response?.data?.message || t("sharingViewFailedDesc"),
        variant: "destructive",
      });
      setIsDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
      setViewingShareId(null);
    }
  };

  const handleDownloadShare = async (shareId: string, fileName: string) => {
    setIsDownloading(true);
    try {
      await sharingService.downloadSharedFile(shareId, fileName);
      toast({
        title: t("sharingDownloadStartedTitle") || "Download Started",
        description: t("sharingDownloadStartedDesc") || "File download has started",
      });
    } catch (error: any) {
      console.error('Failed to download file:', error);
      toast({
        title: t("sharingDownloadFailedTitle") || "Download Failed",
        description: error.response?.data?.message || error.message || t("sharingDownloadFailedDesc") || "Could not download the file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileClick = (share: SharedFileListItem) => {
    // Convert SharedFileListItem to FileData format
    const fileData: FileData = {
      id: share.id,
      file_code: share.file_code,
      file_name: share.file_name,
      file_size: share.file_size,
      file_type: share.file_type,
      // `FilePreview` will fetch shared files using `/v1/sharing/{shareId}/download/`.
      file_url: '',
      source: 'shared',
      owner: {
        id: share.shared_by || '',
        email: '',
        full_name: share.shared_by_name,
        user_type: 'student'
      },
      uploaded_at: share.shared_at,
      is_deleted: false,
      deleted_at: null,
      shared_by: {
        id: share.shared_by || '',
        email: '',
        full_name: share.shared_by_name,
        user_type: 'student'
      },
      shared_at: share.shared_at,
      accepted: share.status === 'accepted'
    };
    setPreviewFile(fileData);
    setPreviewDialogOpen(true);
  };

  const handlePreviewDownload = async (file: FileData) => {
    // Find the corresponding share
    const allShares = [...pendingRequests, ...sharedWithMe, ...myShares];
    const share = allShares.find(s => s.file_code === file.file_code);
    if (share) {
      await handleDownloadShare(share.id, share.file_name);
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-8 w-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">{t("sharingStatusPending")}</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">{t("sharingStatusAccepted")}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">{t("sharingStatusRejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav userRole={user?.user_type || "student"} userName={user?.full_name || user?.email || "User"} />
      
      <main className="container max-w-6xl px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Share2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">{t("sharingPageTitle")}</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("sharingPageDescription")}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full gap-1 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible">
                <TabsTrigger value="requests" className="flex-1 whitespace-nowrap">
                  <Clock className="h-4 w-4 mr-2" />
                  {t("sharingTabRequests")}
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="shared-with-me" className="flex-1 whitespace-nowrap">
                  <Download className="h-4 w-4 mr-2" />
                  {t("sharingTabShared")}
                </TabsTrigger>
                <TabsTrigger value="my-shares" className="flex-1 whitespace-nowrap">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("sharingTabMyShares")}
                </TabsTrigger>
              </TabsList>

              {/* Pending Requests Tab */}
              <TabsContent value="requests" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">{t("sharingPendingEmptyTitle")}</h3>
                    <p className="text-muted-foreground">{t("sharingPendingEmptyDesc")}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingRequests.map((share) => (
                      <Card 
                        key={share.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleFileClick(share)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              {/* File Icon */}
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(share.file_type)}
                              </div>
                              
                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="mb-1 break-words text-base font-semibold sm:text-lg">{share.file_name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {t("sharingFromLabel")}: <span className="font-medium text-foreground">{share.shared_by_name}</span>
                                </p>
                                
                                {share.message && (
                                  <p className="text-sm bg-muted/50 p-2 rounded mb-2 italic">
                                    "{share.message}"
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{t("filesCode")}: <code className="break-all rounded bg-muted px-1 py-0.5">{share.file_code}</code></span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{t("sharingSharedLabel")} {getRelativeTime(share.shared_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 flex-shrink-0 sm:flex" onClick={(e) => e.stopPropagation()}>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptShare(share.id, share.file_name);
                                }}
                                disabled={isProcessing}
                                size="sm"
                                className="h-10 w-full"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {t("accept")}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectShare(share.id, share.file_name);
                                }}
                                disabled={isProcessing}
                                size="sm"
                                className="h-10 w-full"
                              >
                                <X className="h-4 w-4 mr-2" />
                                {t("decline")}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Shared With Me Tab */}
              <TabsContent value="shared-with-me" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sharedWithMe.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">{t("sharingSharedEmptyTitle")}</h3>
                    <p className="text-muted-foreground">{t("sharingSharedEmptyDesc")}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sharedWithMe.map((share) => (
                      <Card 
                        key={share.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleFileClick(share)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(share.file_type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <h3 className="break-words text-base font-semibold sm:text-lg">{share.file_name}</h3>
                                  {getStatusBadge(share.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {t("sharingFromLabel")}: <span className="font-medium text-foreground">{share.shared_by_name}</span>
                                </p>
                                
                                {share.message && (
                                  <p className="text-sm bg-muted/50 p-2 rounded mb-2 italic">
                                    "{share.message}"
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{t("filesCode")}: <code className="break-all rounded bg-muted px-1 py-0.5">{share.file_code}</code></span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{t("sharingSharedLabel")} {getRelativeTime(share.shared_at)}</span>
                                  {share.accepted_at && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <span>{t("sharingAcceptedLabel")} {getRelativeTime(share.accepted_at)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 flex-shrink-0 sm:flex" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewShare(share.id);
                                }}
                                disabled={viewingShareId === share.id}
                                className="h-10 w-full sm:w-auto"
                              >
                                {viewingShareId === share.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4 mr-2" />
                                )}
                                  {t("sharingViewButton")}
                              </Button>
                              {share.status === 'accepted' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadShare(share.id, share.file_name);
                                  }}
                                  disabled={isDownloading}
                                  className="h-10 w-full sm:w-auto"
                                >
                                  {isDownloading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                  )}
                                  {t("download")}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* My Shares Tab */}
              <TabsContent value="my-shares" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myShares.length === 0 ? (
                  <div className="text-center py-12">
                    <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">{t("sharingMySharesEmptyTitle")}</h3>
                    <p className="text-muted-foreground">{t("sharingMySharesEmptyDesc")}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myShares.map((share) => (
                      <Card 
                        key={share.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleFileClick(share)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(share.file_type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <h3 className="break-words text-base font-semibold sm:text-lg">{share.file_name}</h3>
                                  {getStatusBadge(share.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {t("sharingSharedWithLabel")}: <span className="font-medium text-foreground">{share.shared_with_name}</span>
                                </p>
                                
                                {share.message && (
                                  <p className="text-sm bg-muted/50 p-2 rounded mb-2 italic">
                                    "{share.message}"
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{t("filesCode")}: <code className="break-all rounded bg-muted px-1 py-0.5">{share.file_code}</code></span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{t("sharingSharedLabel")} {getRelativeTime(share.shared_at)}</span>
                                  {share.accepted_at && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <span className="flex items-center gap-1 text-green-600">
                                        <UserCheck className="h-3 w-3" />
                                        {t("sharingAcceptedLabel")} {getRelativeTime(share.accepted_at)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
      </main>
      
      <BottomNav />

      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) {
          setSelectedShare(null);
        }
      }}>
        <DialogContent className="max-w-xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("sharingDialogTitle")}</DialogTitle>
            <DialogDescription>{t("sharingDialogDescription")}</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              {t("sharingLoadingDetails")}
            </div>
          ) : selectedShare ? (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(selectedShare.upload.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-lg font-semibold">{selectedShare.upload.file_name}</h3>
                    {getStatusBadge(selectedShare.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("filesCode")}: <code className="break-all rounded bg-muted px-1 py-0.5">{selectedShare.upload.file_code}</code>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("filesSize")}: {formatFileSize(selectedShare.upload.file_size)}
                  </p>
                </div>
              </div>

              {selectedShare.message && (
                <div className="bg-muted/60 rounded-lg p-3 text-sm italic">
                  "{selectedShare.message}"
                </div>
              )}

              <div className="grid gap-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-muted-foreground">{t("sharingDialogSharedBy")}</span>
                  <span className="font-medium">{selectedShare.shared_by_name}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-muted-foreground">{t("sharingDialogSharedWith")}</span>
                  <span className="font-medium">{selectedShare.shared_with_name}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-muted-foreground">{t("sharingDialogSharedAt")}</span>
                  <span>{new Date(selectedShare.shared_at).toLocaleString()}</span>
                </div>
                {selectedShare.accepted_at && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-muted-foreground">{t("sharingDialogAcceptedAt")}</span>
                    <span>{new Date(selectedShare.accepted_at).toLocaleString()}</span>
                  </div>
                )}
                {selectedShare.rejected_at && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-muted-foreground">{t("sharingDialogRejectedAt")}</span>
                    <span>{new Date(selectedShare.rejected_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("sharingDetailsUnavailable")}
            </div>
          )}
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedShare?.status === 'accepted'
                ? t("sharingDialogDownloadHintAccepted")
                : t("sharingDialogDownloadHintPending")}
            </p>
            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
              {selectedShare?.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => selectedShare && handleAcceptShare(selectedShare.id, selectedShare.upload.file_name)}
                    disabled={isProcessing}
                    className="h-10 w-full sm:w-auto"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {t("accept")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedShare && handleRejectShare(selectedShare.id, selectedShare.upload.file_name)}
                    disabled={isProcessing}
                    className="h-10 w-full sm:w-auto"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    {t("decline")}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="secondary"
                disabled={selectedShare?.status !== 'accepted' || isDownloading}
                onClick={() => selectedShare && handleDownloadShare(selectedShare.id, selectedShare.upload.file_name)}
                className="h-10 w-full sm:w-auto"
              >
                {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {t("download")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <FilePreview
        file={previewFile}
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        onDownload={handlePreviewDownload}
      />
    </div>
  );
};

export default Sharing;
