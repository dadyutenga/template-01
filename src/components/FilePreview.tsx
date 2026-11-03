import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, Download, ExternalLink } from "lucide-react";
import { FileData } from "@/services/fileService";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";

interface FilePreviewProps {
  file: FileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (file: FileData) => void;
}

const FilePreview = ({ file, open, onOpenChange, onDownload }: FilePreviewProps) => {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && file) {
      setIsLoading(true);
      setError(null);
      
      // Clean up previous blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }

      // Fetch the file with authentication.
      const fetchFile = async () => {
        if (file.source === 'upload') {
          try {
            // Use axios to fetch with proper auth and CORS handling
            const response = await api.get(`/v1/uploads/${file.file_code}/download/`, {
              responseType: 'blob',
              // Add withCredentials for CORS
              withCredentials: false, // Important: Set to false if your API doesn't use cookies
              // Add headers to ensure proper binary handling
              headers: {
                'Accept': '*/*', // Accept any content type
              },
              // Increase timeout for larger files
              timeout: 60000, // 60 seconds
            });
            
            const blob = response.data;
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setIsLoading(false);
          } catch (err: any) {
            console.error('Failed to fetch file for preview:', err);
            console.error('Error details:', {
              status: err.response?.status,
              statusText: err.response?.statusText,
              message: err.message,
              code: err.code,
              responseHeaders: err.response?.headers,
              requestURL: err.config?.url,
              requestHeaders: err.config?.headers
            });
            
            // Check if it's a CORS error
            if (!err.response && err.message?.includes('Network Error')) {
              console.error('⚠️ Likely CORS error - backend needs to allow:', {
                origin: window.location.origin,
                headers: ['Authorization', 'Accept'],
                methods: ['GET', 'OPTIONS']
              });
            }
            
            // Provide more specific error messages
            let errorMessage = language === 'en' ? 'Failed to load file' : 'Imeshindwa kupakia faili';
            
            if (err.code === 'ERR_NETWORK') {
              errorMessage = language === 'en' 
                ? 'Network error. Please check your connection.' 
                : 'Hitilafu ya mtandao. Tafadhali angalia muunganisho wako.';
            } else if (err.response?.status === 403) {
              errorMessage = language === 'en' 
                ? 'Access denied. You may not have permission to view this file.' 
                : 'Ufikiaji umekataliwa. Huenda huna ruhusa ya kuona faili hii.';
            } else if (err.response?.status === 404) {
              errorMessage = language === 'en' 
                ? 'File not found.' 
                : 'Faili haijapatikana.';
            } else if (err.code === 'ECONNABORTED') {
              errorMessage = language === 'en' 
                ? 'Request timeout. The file may be too large or connection is slow.' 
                : 'Muda umeisha. Faili inaweza kuwa kubwa sana au muunganisho ni polepole.';
            }
            
            setError(errorMessage);
            setIsLoading(false);
          }
        } else {
          // For shared files, fetch via the protected sharing download endpoint.
          // In our "shared" FileData shape, `file.id` is the shareId.
          try {
            const response = await api.get(`/v1/sharing/${file.id}/download/`, {
              responseType: "blob",
              headers: { Accept: "*/*" },
              timeout: 60000,
            });

            const blob = response.data;
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setIsLoading(false);
          } catch (err: any) {
            console.error("Failed to fetch shared file for preview:", err);

            let errorMessage =
              language === "en" ? "Failed to load file" : "Imeshindwa kupakia faili";

            if (!err.response && err.message?.includes("Network Error")) {
              errorMessage =
                language === "en"
                  ? "Network error. Please check your connection."
                  : "Hitilafu ya mtandao. Tafadhali angalia muunganisho wako.";
            } else if (err.response?.status === 403) {
              errorMessage =
                language === "en"
                  ? "Access denied. Accept the share to view this file."
                  : "Ufikiaji umekataliwa. Kubali kushiriki ili kuona faili hii.";
            } else if (err.response?.status === 404) {
              errorMessage = language === "en" ? "File not found." : "Faili haijapatikana.";
            } else if (err.code === "ECONNABORTED") {
              errorMessage =
                language === "en"
                  ? "Request timeout. The file may be too large or connection is slow."
                  : "Muda umeisha. Faili inaweza kuwa kubwa sana au muunganisho ni polepole.";
            }

            setError(errorMessage);
            setIsLoading(false);
          }
        }
      };

      fetchFile();
    }

    // Cleanup function
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [open, file, language]); // Added language to dependencies

  if (!file) return null;

  const fileUrl = blobUrl || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full mx-2 sm:mx-auto p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 border-b bg-background/95 backdrop-blur">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm sm:text-base md:text-lg lg:text-xl truncate pr-1 sm:pr-2 mb-1 sm:mb-2">
                {file.file_name}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{file.file_type}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs">
                  {file.file_size < 1024 
                    ? `${file.file_size} B` 
                    : file.file_size < 1024 * 1024 
                    ? `${(file.file_size / 1024).toFixed(2)} KB` 
                    : `${(file.file_size / (1024 * 1024)).toFixed(2)} MB`}
                </span>
                {file.owner && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span className="truncate max-w-[80px] sm:max-w-[100px] md:max-w-none text-[10px] sm:text-xs hidden md:inline">{file.owner.full_name}</span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground ml-2 sm:ml-3">
                {language === 'en' ? "Opening file..." : "Inafungua faili..."}
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="text-xs sm:text-sm">
              <AlertDescription className="text-[11px] sm:text-xs md:text-sm">{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="text-4xl sm:text-5xl md:text-6xl">📄</div>
              <p className="text-center text-xs sm:text-sm md:text-base text-muted-foreground px-2 sm:px-4">
                {language === 'en' 
                  ? "File is ready to view. Click 'Open in New Tab' to view the file."
                  : "Faili iko tayari kuona. Bonyeza 'Fungua Kwenye Kichupo Kipya' kuona faili."}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 pt-1 sm:pt-2">
            <Button 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (fileUrl) {
                  window.open(fileUrl, '_blank');
                }
              }}
              disabled={!fileUrl || isLoading}
              className="w-full h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {language === 'en' ? "Open in New Tab" : "Fungua Kwenye Kichupo Kipya"}
            </Button>
            <div className="flex gap-2 sm:gap-2.5 md:gap-3">
              {onDownload && (
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                  disabled={isLoading}
                  className="flex-1 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">{language === 'en' ? "Download" : "Pakua"}</span>
                  <span className="xs:hidden">{language === 'en' ? "Download" : "Pakua"}</span>
                </Button>
              )}
              <Button 
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChange(false);
                }}
                className="flex-1 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">{language === 'en' ? "Close" : "Funga"}</span>
                <span className="xs:hidden">{language === 'en' ? "Close" : "Funga"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
