import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";
import { resolveMediaUrl } from "@/lib/media";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.03 },
  },
};

const ProfileEdit = () => {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  const hasFetchedRef = useRef(false);

  const t =
    language === "en"
      ? {
          pageTitle: "Edit Profile",
          pageSubtitle: "Update your username and profile photo.",
          back: "Back",
          photoSection: "Profile Photo",
          changePhoto: "Change Photo",
          removePhoto: "Remove Photo",
          uploadingPhoto: "Uploading...",
          removingPhoto: "Removing...",
          username: "Username",
          usernamePlaceholder: "Enter your username",
          fullName: "Full Name",
          fullNameHint: "Your full name cannot be changed here.",
          email: "Email Address",
          emailHint: "Your email is linked to your account login.",
          saveChanges: "Save Changes",
          saving: "Saving...",
          cancel: "Cancel",
          validationError: "Validation Error",
          usernameRequired: "Username is required",
          profileUpdated: "Profile updated successfully",
          profileUpdatedDesc: "Your profile details have been saved.",
          updateFailed: "Update Failed",
          imageUpdated: "Profile photo updated",
          imageUpdatedDesc: "Your profile picture has been uploaded successfully.",
          imageRemoved: "Profile photo removed",
          imageRemovedDesc: "Your profile picture has been removed.",
          imageUploadFailed: "Image Upload Failed",
          imageRemoveFailed: "Remove Failed",
          invalidFile: "Invalid File",
          invalidFileDesc: "Please select an image file",
          fileTooLarge: "File Too Large",
          fileTooLargeDesc: "Image must be less than 5MB",
          failedToLoad: "Failed to Load Profile",
          failedToLoadDesc: "Could not fetch your profile information",
        }
      : {
          pageTitle: "Hariri Wasifu",
          pageSubtitle: "Sasisha username yako na picha ya wasifu.",
          back: "Rudi",
          photoSection: "Picha ya Wasifu",
          changePhoto: "Badilisha Picha",
          removePhoto: "Ondoa Picha",
          uploadingPhoto: "Inapakia...",
          removingPhoto: "Inaondoa...",
          username: "Username",
          usernamePlaceholder: "Weka username yako",
          fullName: "Jina Kamili",
          fullNameHint: "Jina lako kamili haliwezi kubadilishwa hapa.",
          email: "Anwani ya Barua Pepe",
          emailHint: "Barua pepe yako imeunganishwa na kuingia kwenye akaunti.",
          saveChanges: "Hifadhi Mabadiliko",
          saving: "Inahifadhi...",
          cancel: "Ghairi",
          validationError: "Hitilafu ya Uthibitishaji",
          usernameRequired: "Username inahitajika",
          profileUpdated: "Wasifu umeasishwa kwa mafanikio",
          profileUpdatedDesc: "Taarifa zako za wasifu zimehifadhiwa.",
          updateFailed: "Kusasisha Kumeshindwa",
          imageUpdated: "Picha ya wasifu imeasishwa",
          imageUpdatedDesc: "Picha yako ya wasifu imepakiwa kwa mafanikio.",
          imageRemoved: "Picha ya wasifu imeondolewa",
          imageRemovedDesc: "Picha yako ya wasifu imeondolewa.",
          imageUploadFailed: "Upakiaji wa Picha Umeshindwa",
          imageRemoveFailed: "Kuondoa Kumeshindwa",
          invalidFile: "Faili Batili",
          invalidFileDesc: "Tafadhali chagua faili ya picha",
          fileTooLarge: "Faili Ni Kubwa Sana",
          fileTooLargeDesc: "Picha lazima iwe chini ya 5MB",
          failedToLoad: "Imeshindwa Kupakia Wasifu",
          failedToLoadDesc: "Haikuweza kupakia taarifa za wasifu wako",
        };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        hasFetchedRef.current = true;
        const response = await authService.getProfile();
        applyProfileData(response?.data);
      } catch (error: any) {
        if (user) applyProfileData(user);
        toast({
          title: t.failedToLoad,
          description: error.response?.data?.message || t.failedToLoadDesc,
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && !isLoadingProfile && !username && !email) {
      applyProfileData(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoadingProfile]);

  const applyProfileData = (profileData: any) => {
    if (!profileData) return;
    setUsername(profileData.username || "");
    setFullName(profileData.full_name || "");
    setEmail(profileData.email || "");
    setProfileImageUrl(resolveMediaUrl(profileData.profile_image_url ?? null));
  };

  const handleProfileUpdate = async () => {
    if (!username.trim()) {
      toast({
        title: t.validationError,
        description: t.usernameRequired,
        variant: "destructive",
      });
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await authService.updateProfile({
        username: username.trim(),
      });
      applyProfileData(response?.data);
      await refreshUser?.();
      toast({
        title: response?.message || t.profileUpdated,
        description: t.profileUpdatedDesc,
      });
      navigate("/profile");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.username?.[0] ||
        (language === "en"
          ? "Failed to update your profile."
          : "Imeshindwa kusasisha wasifu wako.");
      toast({
        title: t.updateFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: t.invalidFile,
        description: t.invalidFileDesc,
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t.fileTooLarge,
        description: t.fileTooLargeDesc,
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await authService.uploadProfileImage(file);
      applyProfileData(response?.data);
      await refreshUser?.();
      toast({
        title: response?.message || t.imageUpdated,
        description: t.imageUpdatedDesc,
      });
    } catch (error: any) {
      toast({
        title: t.imageUploadFailed,
        description:
          error.response?.data?.message ||
          (language === "en"
            ? "Failed to upload profile image."
            : "Imeshindwa kupakia picha ya wasifu."),
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setIsRemovingImage(true);
    try {
      const response = await authService.removeProfileImage();
      applyProfileData(response?.data);
      setProfileImageUrl(null);
      await refreshUser?.();
      toast({
        title: response?.message || t.imageRemoved,
        description: t.imageRemovedDesc,
      });
    } catch (error: any) {
      toast({
        title: t.imageRemoveFailed,
        description:
          error.response?.data?.message ||
          (language === "en"
            ? "Failed to remove profile image."
            : "Imeshindwa kuondoa picha ya wasifu."),
        variant: "destructive",
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  const userRole = user?.user_type === "lecturer" ? "lecturer" : "student";
  const userName = fullName || username || user?.email || "";

  const avatarFallback = username
    ? username.slice(0, 2).toUpperCase()
    : fullName
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : email
        ? email[0].toUpperCase()
        : "U";

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <DashboardNav userRole={userRole} userName={userName} />
        <main className="container max-w-2xl px-4 py-8">
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav userRole={userRole} userName={userName} />

      <main className="container max-w-2xl px-4 py-6 md:py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {/* Back nav */}
          <motion.div variants={fadeUp}>
            <button
              id="edit-profile-back"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.back}</span>
            </button>
          </motion.div>

          {/* Page title */}
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t.pageSubtitle}
            </p>
          </motion.div>

          {/* Photo upload card */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {t.photoSection}
                </p>

                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* Avatar with camera overlay */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                      <AvatarImage src={profileImageUrl ?? "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    {!isUploadingImage && !isRemovingImage && (
                      <label
                        htmlFor="profile-image-edit"
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </label>
                    )}
                  </div>

                  <input
                    type="file"
                    id="profile-image-edit"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploadingImage || isRemovingImage}
                  />

                  {/* Actions */}
                  <div className="flex flex-wrap items-start gap-3">
                    <Button
                      asChild
                      variant="outline"
                      disabled={isUploadingImage || isRemovingImage}
                      className="rounded-2xl border-border bg-card"
                    >
                      <label
                        htmlFor="profile-image-edit"
                        className="cursor-pointer"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.uploadingPhoto}
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            {t.changePhoto}
                          </>
                        )}
                      </label>
                    </Button>

                    {profileImageUrl && (
                      <Button
                        variant="ghost"
                        disabled={isUploadingImage || isRemovingImage}
                        onClick={handleRemoveImage}
                        className="rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        {isRemovingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.removingPhoto}
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.removePhoto}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit form card */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="space-y-5 p-6">
                {/* Username — the only editable field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-username"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t.username}
                  </Label>
                  <Input
                    id="edit-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSavingProfile}
                    placeholder={t.usernamePlaceholder}
                    className="rounded-2xl border-border bg-muted/40 focus:bg-card"
                  />
                </div>

                {/* Full name — read-only display */}
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {t.fullName}
                  </p>
                  <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-sm text-foreground">{fullName || "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.fullNameHint}</p>
                </div>

                {/* Email — read-only display */}
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {t.email}
                  </p>
                  <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-sm text-foreground">{email || "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.emailHint}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <Button
                    id="save-profile-changes"
                    onClick={handleProfileUpdate}
                    disabled={isSavingProfile || !username.trim()}
                    variant="hero"
                    className="flex-1 rounded-2xl shadow-sm shadow-primary/20"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      t.saveChanges
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    disabled={isSavingProfile}
                    className="rounded-2xl border-border bg-card"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfileEdit;
