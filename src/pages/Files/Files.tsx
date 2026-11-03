import { useState, useEffect } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  Download,
  Trash2,
  Loader2,
  Info,
  File,
  Music,
  Video,
  FileCode,
  Share2,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import fileService, { FileData } from "@/services/fileService";
import sharingService from "@/services/sharingService";
import friendsService, { UserInfo } from "@/services/friendsService";
import uploadService from "@/services/uploadService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FilePreview from "@/components/FilePreview";

const Files = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  // Files state
  const [allFiles, setAllFiles] = useState<FileData[]>([]);
  const [myUploads, setMyUploads] = useState<FileData[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileData[]>([]);

  // Loading states
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Sharing states
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [friendSearchQuery, setFriendSearchQuery] = useState<string>("");
  const [shareMessage, setShareMessage] = useState<string>("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAllFiles();
  }, [user, navigate]);

  const fetchAllFiles = async (force = false) => {
    if (!force && allFiles.length > 0) return;
    setIsLoadingAll(true);
    try {
      const response = await fileService.getAllFiles();
      setAllFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Failed to fetch all files:", error);
      toast({
        title: t("filesLoadFailed"),
        description: error.response?.data?.message || t("filesLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  const fetchMyUploads = async (force = false) => {
    if (!force && myUploads.length > 0) return;
    setIsLoadingUploads(true);
    try {
      const response = await fileService.getMyUploads();
      const files = Array.isArray(response.data) ? response.data : [];
      // Filter out deleted files - they should only appear in trash
      const activeFiles = files.filter(file => !file.is_deleted);
      setMyUploads(activeFiles);
    } catch (error: any) {
      console.error("Failed to fetch uploads:", error);
      toast({
        title: t("filesLoadFailed"),
        description: error.response?.data?.message || t("filesLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingUploads(false);
    }
  };

  const fetchSharedFiles = async (force = false) => {
    if (!force && sharedFiles.length > 0) return;
    setIsLoadingShared(true);
    try {
      const response = await fileService.getSharedWithMe();
      setSharedFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Failed to fetch shared files:", error);
      toast({
        title: t("filesLoadFailed"),
        description: error.response?.data?.message || t("filesLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "my-uploads" && myUploads.length === 0) {
      fetchMyUploads();
    } else if (value === "shared" && sharedFiles.length === 0) {
      fetchSharedFiles();
    }
  };

  const handleShareClick = async (file: FileData) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
    setSelectedFriend("");
    setFriendSearchQuery("");
    setShareMessage("");
    
    // Fetch accepted friends
    setIsLoadingFriends(true);
    try {
      const response = await friendsService.getFriends('accepted');
      // Extract user info from friend_info
      const friendsList = response.results.map(f => f.friend_info);
      setFriends(friendsList || []);
    } catch (error: any) {
      console.error("Failed to fetch friends:", error);
      toast({
        title: t("filesLoadFailed"),
        description: "Could not load friends",
        variant: "destructive",
      });
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleShare = async () => {
    if (!selectedFile || !selectedFriend) {
      toast({
        title: t("filesShareFailed") || "Share Failed",
        description: language === 'en' 
          ? "Please select a file and a friend to share with." 
          : "Tafadhali chagua faili na rafiki wa kushiriki naye.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file_code
    if (!selectedFile.file_code || selectedFile.file_code.trim() === '') {
      toast({
        title: t("filesShareFailed") || "Share Failed",
        description: language === 'en'
          ? "Invalid file. Please try selecting the file again."
          : "Faili si halali. Tafadhali jaribu kuchagua faili tena.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate friend ID
    const friendId = selectedFriend.trim();
    if (!friendId || friendId === '') {
      toast({
        title: t("filesShareFailed") || "Share Failed",
        description: language === 'en'
          ? "Please select a friend to share with."
          : "Tafadhali chagua rafiki wa kushiriki naye.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate that user owns the file (only uploader can share)
    if (selectedFile.source !== "upload" && (!selectedFile.owner || selectedFile.owner.id !== user?.id)) {
      toast({
        title: t("filesShareFailed") || "Share Failed",
        description: language === 'en'
          ? "Only the file owner can share this file."
          : "Mwenye faili peke yake anaweza kushiriki faili hii.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSharing(true);
    try {
      console.log('🔵 Files page - Sharing file:', {
        fileCode: selectedFile.file_code,
        fileId: selectedFile.id,
        fileName: selectedFile.file_name,
        friendId: friendId,
        friendIdType: typeof friendId,
        message: shareMessage,
        userOwnsFile: selectedFile.source === "upload" || (selectedFile.owner && selectedFile.owner.id === user?.id)
      });
      
      const response = await sharingService.shareFile(
        selectedFile.file_code,
        friendId,
        shareMessage
      );
      
      console.log('🟢 Files page - Share successful:', response);
      
      toast({
        title: t("filesSharedSuccess") || "File Shared",
        description: response.message || response.data?.message || t("filesSharedSuccessDesc") || (language === 'en'
          ? "The file has been shared successfully. The recipient will be notified."
          : "Faili imeshirikiwa kwa mafanikio. Mpokeaji ataonyeshwa."),
      });
      
      setShareDialogOpen(false);
      setSelectedFriend("");
      setShareMessage("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("🔴 Files page - Failed to share file:", error);
      console.error("🔴 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullError: error
      });
      
      // Extract error message - the error should already have a good message from the service
      let errorMessage = error.message || t("filesShareFailedDesc") || (language === 'en'
        ? "Could not share this file."
        : "Haikuweza kushiriki faili hii.");
      
      // If the service didn't extract it properly, try again
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorMessage;
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
        }
      }
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 400) {
        // Check for specific 400 errors from API
        if (errorMessage.includes('already shared') || errorMessage.includes('duplicate')) {
          errorMessage = language === 'en'
            ? "You have already shared this file with this user."
            : "Tayari umeshiriki faili hii na mtumiaji huyu.";
        } else if (errorMessage.includes('not in the same class') || errorMessage.includes('class')) {
          errorMessage = language === 'en'
            ? "You can only share files with users in the same class."
            : "Unaweza kushiriki faili tu na watumiaji katika darasa lile lile.";
        } else if (errorMessage.includes('not your file') || errorMessage.includes('not the uploader')) {
          errorMessage = language === 'en'
            ? "Only the file owner can share this file."
            : "Mwenye faili peke yake anaweza kushiriki faili hii.";
        } else if (!errorMessage.includes('check') && !errorMessage.includes('invalid')) {
          errorMessage = errorMessage || (language === 'en'
            ? "Invalid request. Please check the file and recipient."
            : "Ombi si halali. Tafadhali angalia faili na mpokeaji.");
        }
      } else if (error.response?.status === 403) {
        errorMessage = errorMessage || (language === 'en'
          ? "You don't have permission to share this file. Only the file owner can share."
          : "Huna ruhusa ya kushiriki faili hii. Mwenye faili peke yake anaweza kushiriki.");
      } else if (error.response?.status === 404) {
        errorMessage = errorMessage || (language === 'en'
          ? "File or user not found. Please verify the file exists and the recipient is valid."
          : "Faili au mtumiaji haupatikani. Tafadhali hakikisha faili lipo na mpokeaji ni halali.");
      } else if (error.response?.status === 500) {
        errorMessage = errorMessage || (language === 'en'
          ? "Server error. Please try again later."
          : "Hitilafu ya seva. Tafadhali jaribu tena baadaye.");
      }
      
      toast({
        title: t("filesShareFailed") || "Share Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    setIsDeleting(true);
    const deletedFileCode = selectedFile.file_code;
    const deletedFileSource = selectedFile.source;
    
    try {
      // For my uploads, use soft delete (sends to trash)
      if (selectedFile.source === "upload") {
        await uploadService.deleteFile(selectedFile.file_code);
      toast({
        title: t("filesDeleteSuccess"),
        description: t("filesDeleteSuccessDesc"),
      });
      } else {
        // For shared files, remove from view (permanent delete from files endpoint)
        await fileService.permanentDeleteFile(selectedFile.file_code);
        toast({
          title: t("filesDeleteSuccess"),
          description: t("filesConfirmDeleteSharedDesc"),
        });
      }
      
      // Immediately update UI by removing the deleted file from local state
      if (activeTab === "all") {
        setAllFiles(prev => prev.filter(file => file.file_code !== deletedFileCode));
      } else if (activeTab === "my-uploads") {
        setMyUploads(prev => prev.filter(file => file.file_code !== deletedFileCode));
      } else if (activeTab === "shared") {
        setSharedFiles(prev => prev.filter(file => file.file_code !== deletedFileCode));
      }
      
      setDeleteDialogOpen(false);
      setSelectedFile(null);
      
      // Force refresh the appropriate list in the background to ensure consistency
      if (activeTab === "all") {
        fetchAllFiles(true).catch(console.error);
      } else if (activeTab === "my-uploads") {
        // Force refresh to get updated list from server
        fetchMyUploads(true).catch(console.error);
      } else if (activeTab === "shared") {
        fetchSharedFiles(true).catch(console.error);
      }
    } catch (error: any) {
      console.error("Failed to delete file:", error);
      toast({
        title: t("filesDeleteFailed"),
        description: error.response?.data?.message || t("filesLoadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (file: FileData) => {
    try {
      // For uploads, use the download endpoint
      if (file.source === "upload") {
        await uploadService.downloadFile(file.file_code, file.file_name);
        toast({
          title: t("filesDownloadSuccess"),
          description: t("filesDownloadSuccessDesc"),
        });
      } else {
        // For shared files, use the file URL directly
    window.open(file.file_url, "_blank");
      }
    } catch (error: any) {
      console.error("Failed to download file:", error);
      toast({
        title: t("filesDownloadFailed"),
        description: error.response?.data?.message || t("filesDownloadFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5" />;
    if (fileType.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("compressed"))
      return <FileArchive className="h-5 w-5" />;
    if (
      fileType.includes("javascript") ||
      fileType.includes("typescript") ||
      fileType.includes("python") ||
      fileType.includes("java")
    )
      return <FileCode className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t("filesBytes")}`;
    if (bytes < 1024) return `${bytes} ${t("filesBytes")}`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} ${t("filesKB")}`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} ${t("filesMB")}`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ${t("filesGB")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "sw" ? "sw-TZ" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterFiles = (files: FileData[]) => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(
      (file) =>
        file.file_name.toLowerCase().includes(query) ||
        file.owner.full_name.toLowerCase().includes(query) ||
        (file.shared_by && file.shared_by.full_name.toLowerCase().includes(query))
    );
  };

  const handleFileClick = (file: FileData) => {
    setPreviewFile(file);
    setPreviewDialogOpen(true);
  };

  const renderFileCard = (file: FileData) => (
    <Card 
      key={file.id} 
      className="hover:shadow-md transition-shadow w-full overflow-hidden cursor-pointer"
      onClick={() => handleFileClick(file)}
    >
      <CardContent className="p-2.5 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
          {/* File icon and info - horizontal on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getFileIcon(file.file_type)}
            </div>
            
            {/* File info */}
            <div className="flex-1 min-w-0 overflow-hidden pr-1">
              <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate leading-tight">{file.file_name}</h3>
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
                <Badge variant={file.source === "upload" ? "default" : "secondary"} className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 sm:px-2">
                  {file.source === "upload" ? t("filesUpload") : t("filesShared")}
                </Badge>
                <span className="text-[10px]">•</span>
                <span className="truncate text-[10px] sm:text-xs">{formatFileSize(file.file_size)}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                {file.source === "upload" ? file.owner.full_name : file.shared_by?.full_name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 hidden lg:block truncate">
                {file.source === "shared" && file.shared_at ? (
                  <>
                    {t("filesSharedAt")}: {formatDate(file.shared_at)}
                  </>
                ) : (
                  <>
                    {t("filesUploadedAt")}: {formatDate(file.uploaded_at)}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons - optimized for mobile screens */}
          <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto sm:flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(file);
              }}
              className="flex-1 sm:flex-initial h-8 sm:h-9 text-xs px-1.5 sm:px-3 min-w-0"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{t("filesDownload")}</span>
            </Button>
            {/* Only show share button for files owned by the current user (only uploader can share) */}
            {user && (file.source === "upload" || (file.owner && (file.owner.id === user.id || String(file.owner.id) === String(user.id)))) && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareClick(file);
                }}
                className="flex-1 sm:flex-initial h-8 sm:h-9 text-xs px-1.5 sm:px-3 min-w-0 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{t("filesShare")}</span>
              </Button>
            )}
            {/* Only show delete button for files owned by the current user */}
            {user && (file.source === "upload" || (file.owner && (file.owner.id === user.id || String(file.owner.id) === String(user.id)))) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(file);
                  setDeleteDialogOpen(true);
                }}
                className="flex-1 sm:flex-initial h-8 sm:h-9 text-xs px-1.5 sm:px-3 min-w-0"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{t("filesDelete")}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (title: string, description: string) => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <File className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-lg font-semibold mb-2">{title}</h3>
      <p className="text-base sm:text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const filteredAllFiles = filterFiles(allFiles);
  const filteredMyUploads = filterFiles(myUploads);
  const filteredSharedFiles = filterFiles(sharedFiles);

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={user?.user_type || "student"}
        userName={user?.full_name || user?.email || ""}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder={t("filesSearchPlaceholder")}
      />

      <main className="container max-w-7xl py-3 md:py-8 px-3 sm:px-4">
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <Folder className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">{t("filesPageTitle")}</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{t("filesPageDescription")}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto gap-1 sm:gap-2 p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2 sm:py-3 px-2 whitespace-nowrap">
                {t("filesTabAll")}
              </TabsTrigger>
              <TabsTrigger value="my-uploads" className="text-xs sm:text-sm py-2 sm:py-3 px-2 whitespace-nowrap">
                {t("filesTabMyUploads")}
              </TabsTrigger>
              <TabsTrigger value="shared" className="text-xs sm:text-sm py-2 sm:py-3 px-2 whitespace-nowrap">
                {t("filesTabShared")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-3 space-y-3">
              <Alert className="flex items-center justify-center py-2">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                <AlertDescription className="text-xs sm:text-sm text-center">{t("filesFilterAll")}</AlertDescription>
              </Alert>
              {isLoadingAll ? (
                renderLoadingState()
              ) : filteredAllFiles.length === 0 ? (
                searchQuery ? (
                  renderEmptyState(t("filesNoFiles"), t("filesNoFilesDesc"))
                ) : (
                  renderEmptyState(t("filesEmptyAll"), t("filesEmptyAllDesc"))
                )
              ) : (
                <div className="grid gap-2.5 sm:gap-4">
                  {filteredAllFiles.map((file) => renderFileCard(file))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-uploads" className="mt-3 space-y-3">
              <Alert className="flex items-center justify-center py-2">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                <AlertDescription className="text-xs sm:text-sm text-center">{t("filesFilterUploads")}</AlertDescription>
              </Alert>
              {isLoadingUploads ? (
                renderLoadingState()
              ) : filteredMyUploads.length === 0 ? (
                searchQuery ? (
                  renderEmptyState(t("filesNoFiles"), t("filesNoFilesDesc"))
                ) : (
                  renderEmptyState(t("filesEmptyUploads"), t("filesEmptyUploadsDesc"))
                )
              ) : (
                <div className="grid gap-2.5 sm:gap-4">
                  {filteredMyUploads.map((file) => renderFileCard(file))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="mt-3 space-y-3">
              <Alert className="flex items-center justify-center py-2">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                <AlertDescription className="text-xs sm:text-sm text-center">{t("filesFilterShared")}</AlertDescription>
              </Alert>
              {isLoadingShared ? (
                renderLoadingState()
              ) : filteredSharedFiles.length === 0 ? (
                searchQuery ? (
                  renderEmptyState(t("filesNoFiles"), t("filesNoFilesDesc"))
                ) : (
                  renderEmptyState(t("filesEmptyShared"), t("filesEmptySharedDesc"))
                )
              ) : (
                <div className="grid gap-2.5 sm:gap-4">
                  {filteredSharedFiles.map((file) => renderFileCard(file))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("filesConfirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFile?.source === "shared" ? t("filesConfirmDeleteSharedDesc") : t("filesConfirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("filesDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-lg sm:text-xl">{t("filesShareDialogTitle") || "File Share"}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t("filesShareDialogDesc") || "Share files with your friends. Type a name to search and select a recipient."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="friend-search" className="text-sm sm:text-base">{t("filesSearchFriend") || "Search Friend"}</Label>
              <Input
                id="friend-search"
                type="text"
                placeholder={t("filesSearchFriendPlaceholder") || "Type friend name or email..."}
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                disabled={isLoadingFriends || isSharing}
                autoFocus={true}
                className="w-full text-sm sm:text-base h-10 sm:h-11"
              />
              
              {isLoadingFriends ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground p-2">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  {t("filesLoadingFriends") || "Loading friends..."}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-xs sm:text-sm text-muted-foreground p-2">
                  {t("filesNoFriendsAvailable") || "No friends available"}
                </div>
              ) : (
                <div className="max-h-[150px] sm:max-h-[200px] overflow-y-auto border rounded-md">
                  {friends
                    .filter((friend) => {
                      const query = friendSearchQuery.toLowerCase();
                      return (
                        friend.full_name.toLowerCase().includes(query) ||
                        friend.email.toLowerCase().includes(query)
                      );
                    })
                    .map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => {
                          setSelectedFriend(friend.id.toString());
                          setFriendSearchQuery(friend.full_name);
                        }}
                        disabled={isSharing}
                        className={`w-full text-left p-2 sm:p-3 hover:bg-accent transition-colors border-b last:border-b-0 ${
                          selectedFriend === friend.id.toString() ? "bg-accent" : ""
                        }`}
                      >
                        <div className="font-medium text-xs sm:text-sm truncate">{friend.full_name}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{friend.email}</div>
                      </button>
                    ))}
                  {friends.filter((friend) => {
                    const query = friendSearchQuery.toLowerCase();
                    return (
                      friend.full_name.toLowerCase().includes(query) ||
                      friend.email.toLowerCase().includes(query)
                    );
                  }).length === 0 && friendSearchQuery && (
                    <div className="text-xs sm:text-sm text-muted-foreground p-2 sm:p-3 text-center">
                      {t("filesNoMatchesFound") || "No matches found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-message" className="text-sm sm:text-base">{t("filesMessage") || "Message (optional)"}</Label>
              <Textarea
                id="share-message"
                placeholder={t("filesMessagePlaceholder") || "Add a message..."}
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={isSharing}
                autoFocus={false}
                className="resize-none text-sm sm:text-base min-h-[60px] sm:min-h-[80px]"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                {shareMessage.length}/500
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button 
                size="sm"
                variant="outline" 
                onClick={() => setShareDialogOpen(false)}
                disabled={isSharing}
                className="flex-1 h-9 text-xs sm:text-sm"
              >
                <span>{t("cancel") || "Cancel"}</span>
              </Button>
              <Button 
                size="sm"
                onClick={handleShare}
                disabled={isSharing || !selectedFriend || isLoadingFriends}
                className="flex-1 h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                )}
                <span>{t("filesShareButton") || "Share"}</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="hidden"></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <FilePreview
        file={previewFile}
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        onDownload={handleDownload}
      />

      <BottomNav />
    </div>
  );
};

export default Files;
