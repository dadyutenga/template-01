import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload as UploadIcon, FileText, Image, FileArchive, Loader2, AlertCircle, Plus, CheckCircle2, Users, BookOpen, ChevronDown, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import uploadService from "@/services/uploadService";
import classService, { ClassData } from "@/services/classService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [customFileName, setCustomFileName] = useState<string>("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState<ClassData | null>(null);

  // Don't fetch classes on mount - fetch when dropdown opens
  // useEffect(() => {
  //   console.log("DEBUG: Upload page mounted");
  //   fetchClasses();
  // }, []);

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    
    try {
      const response = await classService.listClasses({ 
        page: 1, 
        page_size: 100
      });
      
      console.log("🔵 Upload - Classes API Response:", response);
      
      // Use same approach as Classes page - get all classes from endpoint
      // The API returns { count, next, previous, results: [...] }
      const classesList = response.results || response.data || [];
      console.log("🔵 Upload - Classes List:", classesList);
      console.log("🔵 Upload - Classes Count:", classesList.length);
      
      // The API endpoint already returns only classes the user has access to
      // (Lecturers see classes they created or are members of, Students see classes they joined)
      // However, we should still filter by is_member if the field exists to ensure user can upload
      // If is_member field is not present or is undefined, we assume the class is accessible
      let userClasses: ClassData[];
      if (classesList.length > 0 && 'is_member' in classesList[0]) {
        // Filter only classes where user is a member (if is_member field exists)
        userClasses = classesList.filter((cls: ClassData) => {
          const isMember = cls.is_member === true;
          console.log(`🔵 Class: ${cls.name}, is_member: ${cls.is_member}, will include: ${isMember}`);
          return isMember;
        });
      } else {
        // If is_member field doesn't exist, use all classes returned by API
        console.log("🔵 Upload - is_member field not found, using all classes from API");
        userClasses = classesList;
      }
      
      console.log("🔵 Upload - User Classes (after filter):", userClasses);
      console.log("🔵 Upload - User Classes Count:", userClasses.length);
      
      // Sort by created_at descending (latest first)
      const sortedClasses = userClasses.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log("🔵 Upload - Sorted Classes:", sortedClasses);
      
      setClasses(sortedClasses);
    } catch (error: any) {
      console.error("🔴 Upload - Failed to fetch classes:", error);
      toast({
        title: t("classesErrorLoadingClasses") || "Failed to Load Classes",
        description: error.response?.data?.message || t("classesFailedToLoadClasses") || "Please try again later",
        variant: "destructive",
      });
      setClasses([]); // Set empty array on error
    } finally {
      setIsLoadingClasses(false);
    }
  };


  // Fetch classes when popover opens
  const handlePopoverChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      // Always fetch classes when dropdown opens to ensure fresh data (latest first)
      fetchClasses();
      setClassSearchQuery("");
    }
  };


  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!className.trim()) {
      toast({
        title: t("classesValidationError") || "Validation Error",
        description: t("classesNameIsRequired") || "Class name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const rawResponse = await classService.createClass({
        name: className,
        description: classDescription || undefined,
      });
      
      // Normalize payload to handle both direct object and {data: {...}} wrapper
      const response = rawResponse?.data ?? rawResponse;
      
      const classType = response.is_verified ? t("classesVerifiedClass") : t("classesStudyGroup");
      const emoji = response.is_verified ? "✓" : "👥";
      
      toast({
        title: `${emoji} ${classType} ${t("classesCreatedSuccess")}!`,
        description: `"${response.name}" ${t("classesCreatedWithCode")} ${response.class_code}`,
      });
      
      const newClassId = response.id;
      const newClassData = response;
      
      setClassName("");
      setClassDescription("");
      setCreateDialogOpen(false);
      
      // Create class data with is_member: true (creator is always a member)
      const newClassWithMember = { ...newClassData, is_member: true } as ClassData;
      
      // Add the newly created class to the list immediately
      setClasses(prev => {
        const exists = prev.some(cls => cls.id === newClassId);
        if (!exists) {
          return [newClassWithMember, ...prev];
        }
        return prev;
      });
      
      // Store the selected class data and select it
      setSelectedClassData(newClassWithMember);
      setSelectedClass(newClassId);
      
      // Refresh classes list in the background to ensure consistency
      fetchClasses().catch(console.error);
    } catch (error: any) {
      toast({
        title: t("classesFailedToCreate") || "Failed to Create Class",
        description: error.response?.data?.message || t("classesFailedToCreate") || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (50MB = 52428800 bytes)
    const maxSize = 52428800;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: t("uploadFileTooLargeDesc") || "Maximum file size is 50MB",
      };
    }

    // File type validation is handled by backend, but we can do basic checks
    const allowedExtensions = [
      // Documents
      "pdf", "doc", "docx", "txt", "rtf", "odt",
      // Spreadsheets
      "xls", "xlsx", "csv", "ods",
      // Presentations
      "ppt", "pptx", "odp", "key",
      // Images
      "jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico",
      // Videos
      "mp4", "avi", "mov", "wmv", "flv", "mkv", "webm", "m4v",
      // Audio
      "mp3", "wav", "ogg", "flac", "m4a", "aac", "wma",
      // Archives
      "zip", "rar", "tar", "gz", "7z", "bz2", "xz",
    ];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: t("uploadInvalidFileTypeDesc") || "Please select a valid file type",
      };
    }

    return { valid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      console.log('⚠️ No file selected');
      return;
    }

    console.log('🔵 File selected:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified
    });

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast({
        title: validation.error?.includes("size") ? t("uploadFileTooLarge") : t("uploadInvalidFileType"),
        description: validation.error,
        variant: "destructive",
      });
      e.target.value = "";
      setFile(null);
      return;
    }

    // On mobile, create a new File reference to ensure it's preserved
    // This helps prevent issues where mobile browsers clear file references
    const fileToStore = selectedFile;
    
    setFile(fileToStore);
    // Set default file name if custom name is empty
    if (!customFileName) {
      setCustomFileName(selectedFile.name);
    }
    
    console.log('✅ File stored in state:', {
      name: fileToStore.name,
      size: fileToStore.size
    });
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission if event exists
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!file) {
      toast({
        title: t("uploadFileRequired"),
        description: t("uploadFileRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    // If creating a class, don't proceed with upload - user needs to create class first
    if (createDialogOpen) {
      toast({
        title: t("uploadClassRequired"),
        description: t("uploadClassRequiredDesc") || "Please select a class or create one first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClass) {
      toast({
        title: t("uploadClassRequired"),
        description: t("uploadClassRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // CRITICAL: On mobile, file references can be cleared, so we need to validate
      // and create FormData immediately without iterating it first
      if (!file || !file.name) {
        throw new Error("File is no longer available. Please select the file again.");
      }

      // Store file details before creating FormData (for logging)
      const fileDetails = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        selectedClass,
        customFileName
      };

      console.log("🔵 Upload - Starting upload:", fileDetails);
      console.log("🔵 Upload - Is mobile:", /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      // Create FormData immediately - don't iterate before sending (consumes data on mobile)
      // On mobile, ensure file is still valid before creating FormData
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Double-check file is still valid (mobile browsers sometimes clear file references)
      if (!file || !file.name) {
        throw new Error(language === 'en' 
          ? "File is no longer available. Please select the file again."
          : "Faili haipatikani tena. Tafadhali chagua faili tena.");
      }
      
      if (file.size === 0) {
        throw new Error(language === 'en'
          ? "The selected file is empty. Please select a valid file."
          : "Faili uliyochagua ni tupu. Tafadhali chagua faili halali.");
      }
      
      // Store file reference before creating FormData (mobile browsers can clear it)
      // CRITICAL: On mobile, we must preserve the file reference immediately
      const fileToUpload = file;
      const className = String(selectedClass).trim();
      const fileName = customFileName && customFileName.trim() ? customFileName.trim() : null;
      
      // Final validation before creating FormData
      if (!fileToUpload || !fileToUpload.name || fileToUpload.size === 0) {
        throw new Error(language === 'en'
          ? "File is invalid or empty. Please select a valid file."
          : "Faili si halali au ni tupu. Tafadhali chagua faili halali.");
      }
      
      if (!className || className === '') {
        throw new Error(language === 'en'
          ? "Class is required. Please select a class."
          : "Darasa linahitajika. Tafadhali chagua darasa.");
      }
      
      console.log("🔵 Upload - Creating FormData with:", {
        fileName: fileToUpload.name,
        fileSize: fileToUpload.size,
        fileType: fileToUpload.type,
        className,
        customFileName: fileName,
        isMobile,
        fileLastModified: fileToUpload.lastModified
      });
      
      // Create FormData - do this immediately to preserve file reference
      const formData = new FormData();
      
      // Append file first (most important) - use stored reference with explicit filename
      // The third parameter (filename) is important for mobile browsers
      formData.append("file", fileToUpload, fileToUpload.name);
      
      // Append class_obj (required) - ensure it's a string
      formData.append("class_obj", className);
      
      // Append file_name if provided
      if (fileName && fileName !== fileToUpload.name) {
        formData.append("file_name", fileName);
      }
      
      // Verify FormData was created correctly (especially important on mobile)
      if (!formData.has("file")) {
        throw new Error(language === 'en'
          ? "Failed to prepare file for upload. Please try again."
          : "Imeshindwa kuandaa faili kwa upakiaji. Tafadhali jaribu tena.");
      }
      
      if (!formData.has("class_obj")) {
        throw new Error(language === 'en'
          ? "Class information is missing. Please select a class."
          : "Taarifa za darasa hazipo. Tafadhali chagua darasa.");
      }
      
      console.log("🔵 Upload - FormData verified:", {
        hasFile: formData.has("file"),
        hasClass: formData.has("class_obj"),
        hasFileName: formData.has("file_name"),
        fileSize: fileToUpload.size,
        fileName: fileToUpload.name,
        className: className
      });
      
      // IMPORTANT: Don't iterate FormData.entries() - it consumes the data on mobile
      // The service will handle the upload without iterating

      // Log what we're sending (without iterating FormData - that consumes it on mobile)
      console.log("🔵 Upload - FormData prepared:", {
        hasFile: formData.has("file"),
        hasClass: formData.has("class_obj"),
        hasFileName: formData.has("file_name"),
        ...fileDetails
      });

      // IMPORTANT: Don't iterate FormData.entries() before sending on mobile
      // It consumes the data and can cause the file to be lost
      // The uploadService will log the FormData contents if needed

      const response = await uploadService.uploadFile(formData);
      
      console.log("🟢 Upload response:", response);
      console.log("🟢 Upload response type:", typeof response);
      console.log("🟢 Upload response keys:", response ? Object.keys(response) : 'null');
      
      // Handle different API response formats:
      // Format 1: { message: "...", data: {...} }
      // Format 2: { success: true, message: "...", data: {...} }
      // Format 3: Direct data object
      let uploadedFile;
      let successMessage;
      
      if (response) {
        if (response.data) {
          uploadedFile = response.data;
          successMessage = response.message || response.data?.message || t("uploadSuccessDesc");
        } else if (response.success !== undefined) {
          uploadedFile = response.data || response;
          successMessage = response.message || t("uploadSuccessDesc");
        } else {
          // Direct response (no wrapper)
          uploadedFile = response;
          successMessage = response.message || t("uploadSuccessDesc");
        }
      }
      
      console.log("📦 Uploaded file data:", uploadedFile);
      console.log("📦 Success message:", successMessage);
      
      toast({
        title: t("uploadSuccessTitle") || "Upload Successful",
        description: successMessage,
      });

      // Reset form
      setFile(null);
      setSelectedClass("");
      setSelectedClassData(null);
      setCustomFileName("");
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Navigate to files page after a short delay
      setTimeout(() => {
        navigate("/files");
      }, 1500);
    } catch (error: any) {
      console.error("🔴 Upload failed:", error);
      console.error("🔴 Upload error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        request: error.request,
        stack: error.stack
      });
      
      // Log the full error for debugging
      if (error.response?.data) {
        console.error("🔴 API Error Response Data:", JSON.stringify(error.response.data, null, 2));
      }
      
      // Handle specific API error messages
      let errorTitle = t("uploadFailedTitle");
      let errorMessage = t("uploadFailedDesc");
      
      // Network errors (common on mobile)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorTitle = isMobile ? (language === 'en' ? "Upload Timeout" : "Muda wa Upakiaji Umeisha") : "Upload Timeout";
        errorMessage = isMobile 
          ? (language === 'en' 
            ? "The upload took too long. Please check your connection and try again. If the file is large, try using Wi-Fi." 
            : "Upakiaji umechukua muda mrefu. Tafadhali angalia muunganisho wako na ujaribu tena. Ikiwa faili ni kubwa, jaribu kutumia Wi-Fi.")
          : "The upload took too long. Please check your connection and try again with a smaller file.";
      } else if (
        error.code === 'ERR_NETWORK' || 
        error.message?.includes('Network Error') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Load failed') ||
        error.name === 'TypeError' ||
        (!error.response && !error.status)
      ) {
        errorTitle = isMobile ? (language === 'en' ? "Network Error" : "Hitilafu ya Mtandao") : "Network Error";
        errorMessage = isMobile
          ? (language === 'en'
            ? "Please check your internet connection and try again. Make sure you're connected to Wi-Fi or have mobile data enabled."
            : "Tafadhali angalia muunganisho wako wa intaneti na ujaribu tena. Hakikisha umeunganishwa kwa Wi-Fi au una data ya simu imewezeshwa.")
          : "Please check your internet connection and try again.";
      } else if (error.response?.status === 400 || error.status === 400) {
        const responseData = error.response?.data || error.response || {};
        const apiMessage = responseData.message || responseData.detail || responseData.error || "";
        
        if (apiMessage.includes("too large") || apiMessage.includes("100MB") || apiMessage.includes("size")) {
          errorTitle = t("uploadFileTooLarge");
          errorMessage = t("uploadFileTooLargeDesc");
        } else if (apiMessage.includes("type") || apiMessage.includes("extension") || apiMessage.includes("format")) {
          errorTitle = t("uploadInvalidFileType");
          errorMessage = t("uploadInvalidFileTypeDesc");
        } else if (apiMessage.includes("class") || apiMessage.includes("member") || apiMessage.includes("permission")) {
          errorTitle = t("uploadClassRequired");
          errorMessage = apiMessage || t("uploadClassRequiredDesc");
        } else if (apiMessage) {
          errorMessage = apiMessage;
        } else {
          errorMessage = language === 'en' 
            ? "Invalid request. Please check your file and class selection."
            : "Ombi batili. Tafadhali angalia faili yako na uchaguzi wa darasa.";
        }
      } else if (error.response?.status === 401 || error.status === 401) {
        errorTitle = language === 'en' ? "Authentication Error" : "Hitilafu ya Uthibitishaji";
        errorMessage = language === 'en'
          ? "Your session has expired. Please log in again."
          : "Kipindi chako kimeisha. Tafadhali ingia tena.";
      } else if (error.response?.status === 403 || error.status === 403) {
        errorTitle = t("uploadClassRequired");
        errorMessage = error.response?.data?.message || error.response?.message || (language === 'en'
          ? "You must be a member of the class to upload files"
          : "Lazima uwe mwanachama wa darasa ili kupakia faili");
      } else if (error.response?.status === 404 || error.status === 404) {
        errorTitle = t("uploadClassRequired");
        errorMessage = error.response?.data?.message || error.response?.message || (language === 'en'
          ? "Class not found"
          : "Darasa halijapatikana");
      } else if (error.response?.status === 413 || error.status === 413) {
        errorTitle = t("uploadFileTooLarge");
        errorMessage = t("uploadFileTooLargeDesc");
      } else if (error.response?.status >= 500 || error.status >= 500) {
        errorTitle = language === 'en' ? "Server Error" : "Hitilafu ya Seva";
        errorMessage = language === 'en'
          ? "The server encountered an error. Please try again later."
          : "Seva imekumbana na hitilafu. Tafadhali jaribu tena baadaye.";
      } else {
        // Try to extract message from various error formats
        const responseData = error.response?.data || error.response || {};
        errorMessage = responseData.message || 
                      responseData.detail || 
                      responseData.error || 
                      error.message || 
                      errorMessage;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return <UploadIcon className="h-12 w-12" />;
    if (file.type.startsWith("image/")) return <Image className="h-12 w-12" />;
    if (file.type.includes("pdf")) return <FileText className="h-12 w-12" />;
    return <FileArchive className="h-12 w-12" />;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={user?.user_type || "student"}
        userName={user?.full_name || user?.email || ""}
      />
      
      <main className="container py-4 md:py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-2">
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">{t("uploadPageTitle")}</h1>
            <p className="text-sm sm:text-sm md:text-base text-muted-foreground mt-1">{t("uploadPageDescription")}</p>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("uploadFileDetails")}</CardTitle>
              <CardDescription>{t("uploadFileDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }} 
                className="space-y-6"
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="class">{t("uploadSelectClass")}</Label>
                  <Popover open={popoverOpen} onOpenChange={handlePopoverChange}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-auto min-h-10 py-2 px-3 text-left font-normal"
                            disabled={isUploading || createDialogOpen}
                          >
                            {selectedClass ? (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate">
                                  {selectedClassData?.name || classes.find((cls) => cls.id === selectedClass)?.name || t("uploadSelectClassPlaceholder")}
                                </span>
                                {(selectedClassData?.is_verified || classes.find((cls) => cls.id === selectedClass)?.is_verified) && (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{t("uploadSelectClassPlaceholder")}</span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <div className="flex items-center px-3 pb-2 pt-3 border-b">
                            <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                            <input 
                              type="text" 
                              placeholder={t("classesSearch") || "Search class..."}
                              className="flex-1 bg-transparent outline-none text-sm h-8"
                              value={classSearchQuery}
                              onChange={(e) => setClassSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          {isLoadingClasses ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : classes.filter(cls => cls.name.toLowerCase().includes(classSearchQuery.toLowerCase())).length === 0 ? (
                            <div className="p-6 text-center">
                              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {classSearchQuery ? (t("classesNoResults") || "No classes match your search") : (t("uploadNoClasses") || "No classes found")}
                              </p>
                            </div>
                          ) : (
                            <div className="max-h-[250px] overflow-y-auto">
                              {classes
                                .filter(cls => cls.name.toLowerCase().includes(classSearchQuery.toLowerCase()))
                                .map((cls) => (
                                <div
                                  key={cls.id}
                                  onClick={() => {
                                    const newSelectedId = cls.id === selectedClass ? "" : cls.id;
                                    setSelectedClass(newSelectedId);
                                    setSelectedClassData(newSelectedId ? cls : null);
                                    // Clear create dialog when selecting a class
                                    if (createDialogOpen) {
                                      setCreateDialogOpen(false);
                                    }
                                    // Close popover after selection
                                    setPopoverOpen(false);
                                  }}
                                  className={`flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0 ${
                                    selectedClass === cls.id ? "bg-muted" : ""
                                  }`}
                                >
                                  <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <BookOpen className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-sm truncate">{cls.name}</span>
                                            {cls.is_verified && (
                                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            )}
                                        </div>
                                        {cls.description && (
                                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                            {cls.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {selectedClass === cls.id && (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap w-full">
                                    <Badge variant={cls.is_verified ? "default" : "secondary"} className="text-xs">
                                      {cls.is_verified ? t("classesVerifiedShort") || "Verified" : t("classesStudyGroup") || "Group"}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      <span>{cls.member_count || 0} {t("classesMembers") || "members"}</span>
                                    </div>
                                    {cls.user_role && (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {cls.user_role}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      
                      {/* Create Class Dialog */}
                      <Dialog 
                        open={createDialogOpen} 
                        onOpenChange={(open) => {
                          setCreateDialogOpen(open);
                          // Clear selected class when opening create dialog
                          if (open) {
                            setSelectedClass("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2"
                            disabled={isUploading || !!selectedClass}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {user?.user_type === 'lecturer' ? t("classesCreateClass") : t("classesCreateGroup")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[85vh] overflow-y-auto">
                          <DialogHeader className="text-center">
                            <DialogTitle className="text-lg sm:text-xl flex items-center justify-center gap-2">
                              {user?.user_type === 'lecturer' ? (
                                <>
                                  {t("classesCreateVerifiedClass")} <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </>
                              ) : (
                                t("classesCreateGroupTitle")
                              )}
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                              {user?.user_type === 'lecturer' 
                                ? t("classesCreateVerifiedDesc")
                                : t("classesCreateGroupDescription")}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateClass}>
                            <div className="space-y-3 py-1">
                              <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm">
                                  {user?.user_type === 'lecturer' ? t("classesClassName") : t("classesGroupName")}
                                </Label>
                                <Input 
                                  id="name" 
                                  placeholder={t("classesNamePlaceholder")}
                                  value={className}
                                  onChange={(e) => setClassName(e.target.value)}
                                  className="h-10 text-base"
                                  required 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-sm">
                                  {t("classesDescription")} {t("classesDescriptionOptional")}
                                </Label>
                                <Textarea 
                                  id="description" 
                                  placeholder={t("classesDescriptionPlaceholder")}
                                  value={classDescription}
                                  onChange={(e) => setClassDescription(e.target.value)}
                                  className="text-base min-h-[60px]"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-3">
                              <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("classesCreateButton")} {user?.user_type === 'lecturer' ? t("classesClass") : t("classesStudyGroup")}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">{t("uploadSelectFile")}</Label>
                  <label 
                    htmlFor="file"
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer touch-manipulation flex flex-col items-center gap-2 text-muted-foreground block"
                  >
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                      disabled={isUploading}
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.key,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.ico,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.m4v,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.zip,.rar,.tar,.gz,.7z,.bz2,.xz"
                    />
                    {getFileIcon(file)}
                    {file ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-foreground">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{t("uploadClickToUpload")}</span>
                        <span className="text-sm">{t("uploadFileTypes")}</span>
                      </>
                    )}
                  </label>
                </div>

                {file && (
                  <div className="space-y-2">
                    <Label htmlFor="fileName">{t("uploadFileName")}</Label>
                    <Input
                      id="fileName"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={t("uploadFileNamePlaceholder")}
                      disabled={isUploading}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="flex-1 touch-manipulation min-h-[44px]"
                    disabled={isUploading || !file || !selectedClass || createDialogOpen}
                    onClick={(e) => {
                      // Handle click events for desktop
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔵 Upload button clicked (desktop)", {
                        isUploading,
                        hasFile: !!file,
                        hasSelectedClass: !!selectedClass,
                        createDialogOpen,
                        file: file ? { name: file.name, size: file.size, type: file.type } : null,
                        selectedClass
                      });
                      
                      // Validate before submitting
                      if (!file) {
                        toast({
                          title: t("uploadFileRequired"),
                          description: t("uploadFileRequiredDesc"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (!selectedClass) {
                        toast({
                          title: t("uploadClassRequired"),
                          description: t("uploadClassRequiredDesc"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleSubmit(e as any);
                    }}
                    onTouchEnd={(e) => {
                      // Handle touch events for mobile - use onTouchEnd to avoid double-firing
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔵 Upload button touched (mobile)", {
                        isUploading,
                        hasFile: !!file,
                        hasSelectedClass: !!selectedClass,
                        createDialogOpen
                      });
                      
                      // Prevent if disabled
                      if (isUploading || !file || !selectedClass || createDialogOpen) {
                        return;
                      }
                      
                      // Validate before submitting
                      if (!file) {
                        toast({
                          title: t("uploadFileRequired"),
                          description: t("uploadFileRequiredDesc"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (!selectedClass) {
                        toast({
                          title: t("uploadClassRequired"),
                          description: t("uploadClassRequiredDesc"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleSubmit();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("uploadUploading")}
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {t("uploadButton")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={isUploading}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Upload;
