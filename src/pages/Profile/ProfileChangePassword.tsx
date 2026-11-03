import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";

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

const ProfileChangePassword = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const t =
    language === "en"
      ? {
          pageTitle: "Change Password",
          pageSubtitle:
            "Update your password to keep your account secure.",
          back: "Back",
          securityNote: "Security",
          securityNoteText:
            "Choose a strong password with at least 8 characters. Avoid using names or common words.",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmPassword: "Confirm New Password",
          savePassword: "Update Password",
          changing: "Updating...",
          cancel: "Cancel",
          validationError: "Validation Error",
          currentPasswordRequired: "Current password is required",
          passwordsDontMatch: "New passwords do not match",
          passwordTooShort:
            "New password must be at least 8 characters long",
          passwordsMatch: "Passwords match",
          passwordChanged: "Password changed successfully",
          passwordChangedDesc: "Your account password has been updated.",
          passwordChangeFailed: "Password Change Failed",
        }
      : {
          pageTitle: "Badilisha Nenosiri",
          pageSubtitle:
            "Sasisha nenosiri lako ili kulinda akaunti yako.",
          back: "Rudi",
          securityNote: "Usalama",
          securityNoteText:
            "Chagua nenosiri imara lenye angalau herufi 8. Epuka kutumia majina au maneno ya kawaida.",
          currentPassword: "Nenosiri la Sasa",
          newPassword: "Nenosiri Jipya",
          confirmPassword: "Thibitisha Nenosiri Jipya",
          savePassword: "Sasisha Nenosiri",
          changing: "Inasasisha...",
          cancel: "Ghairi",
          validationError: "Hitilafu ya Uthibitishaji",
          currentPasswordRequired: "Nenosiri la sasa linahitajika",
          passwordsDontMatch: "Nenosiri mpya hazifanani",
          passwordTooShort:
            "Nenosiri jipya lazima liwe na angalau herufi 8",
          passwordsMatch: "Nenosiri zinafanana",
          passwordChanged: "Nenosiri limebadilishwa kwa mafanikio",
          passwordChangedDesc: "Nenosiri la akaunti yako limeboreshwa.",
          passwordChangeFailed: "Kubadilisha Nenosiri Kumeshindwa",
        };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast({
        title: t.validationError,
        description: t.currentPasswordRequired,
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: t.validationError,
        description: t.passwordsDontMatch,
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: t.validationError,
        description: t.passwordTooShort,
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast({
        title: response?.message || t.passwordChanged,
        description: t.passwordChangedDesc,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/profile");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        (language === "en"
          ? "Failed to change password."
          : "Imeshindwa kubadilisha nenosiri.");
      toast({
        title: t.passwordChangeFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch =
    newPassword && confirmPassword && newPassword !== confirmPassword;

  const userRole = user?.user_type === "lecturer" ? "lecturer" : "student";
  const userName = user?.full_name || user?.email || "";

  const canSubmit =
    !isChangingPassword &&
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

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
              id="change-password-back"
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

          {/* Security hint banner */}
          <motion.div variants={fadeUp}>
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {t.securityNote}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {t.securityNoteText}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Password form card */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="space-y-5 p-6">
                {/* Current password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="current-password"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t.currentPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isChangingPassword}
                      className="rounded-2xl border-border bg-muted/40 pr-10 focus:bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t.newPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPassword}
                      minLength={8}
                      className="rounded-2xl border-border bg-muted/40 pr-10 focus:bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-xs text-muted-foreground">{t.passwordTooShort}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPassword}
                      className={`rounded-2xl border-border bg-muted/40 pr-10 focus:bg-card ${
                        passwordsMismatch
                          ? "border-rose-300 focus-visible:ring-rose-300"
                          : ""
                      } ${
                        passwordsMatch
                          ? "border-emerald-300 focus-visible:ring-emerald-300"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <p className="text-xs text-rose-500">
                      {t.passwordsDontMatch}
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-emerald-600">
                      ✓ {t.passwordsMatch}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <Button
                    id="save-new-password"
                    onClick={handlePasswordChange}
                    disabled={!canSubmit}
                    variant="hero"
                    className="flex-1 rounded-2xl shadow-sm shadow-primary/20"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.changing}
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        {t.savePassword}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    disabled={isChangingPassword}
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

export default ProfileChangePassword;
