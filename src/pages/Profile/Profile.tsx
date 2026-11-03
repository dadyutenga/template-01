import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  UserRound,
} from "lucide-react";
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

const Profile = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const hasFetchedRef = useRef(false);

  const t =
    language === "en"
      ? {
          profileTitle: "Profile",
          profileSubtitle:
            "View and manage your personal information and account security.",
          studentBadge: "Student",
          lecturerBadge: "Lecturer",
          personalInfo: "Personal Information",
          fullNameLabel: "Full Name",
          usernameLabel: "Username",
          emailLabel: "Email Address",
          account: "Account",
          editProfile: "Edit Profile",
          changePassword: "Change Password",
          failedToLoad: "Failed to Load Profile",
          failedToLoadDesc: "Could not fetch your profile information",
        }
      : {
          profileTitle: "Wasifu",
          profileSubtitle:
            "Angalia na simamia taarifa zako za kibinafsi na usalama wa akaunti.",
          studentBadge: "Mwanafunzi",
          lecturerBadge: "Mwalimu",
          personalInfo: "Taarifa za Kibinafsi",
          fullNameLabel: "Jina Kamili",
          usernameLabel: "Username",
          emailLabel: "Anwani ya Barua Pepe",
          account: "Akaunti",
          editProfile: "Hariri Wasifu",
          changePassword: "Badilisha Nenosiri",
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

  const userRole = user?.user_type === "lecturer" ? "lecturer" : "student";
  const isLecturer = user?.user_type === "lecturer";
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

  const infoRows = [
    { label: t.fullNameLabel, value: fullName || "—", icon: UserRound },
    { label: t.usernameLabel, value: username || "—", icon: UserRound },
    { label: t.emailLabel, value: email || "—", icon: Mail },
  ];

  const actionRows = [
    {
      label: t.editProfile,
      icon: Pencil,
      href: "/profile/edit",
      id: "edit-profile-action",
    },
    {
      label: t.changePassword,
      icon: KeyRound,
      href: "/profile/change-password",
      id: "change-password-action",
    },
  ];

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
          className="space-y-4"
        >
          {/* Page header */}
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              {t.profileTitle}
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t.profileSubtitle}
            </p>
          </motion.div>

          {/* Identity card */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 flex-shrink-0 ring-4 ring-primary/10">
                    <AvatarImage src={profileImageUrl ?? "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-bold text-foreground">
                      {fullName || username || "—"}
                    </p>
                    {username && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        @{username}
                      </p>
                    )}
                    <div className="mt-2.5">
                      <Badge className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary hover:bg-primary/5">
                        <GraduationCap className="mr-1.5 h-3 w-3" />
                        {isLecturer ? t.lecturerBadge : t.studentBadge}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal information — display rows */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="px-6 pt-5 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {t.personalInfo}
                  </p>
                </div>

                {infoRows.map((row, index) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between px-6 py-4">
                      <p className="text-sm text-muted-foreground">{row.label}</p>
                      <p className="max-w-[55%] truncate text-right text-sm font-semibold text-foreground">
                        {row.value}
                      </p>
                    </div>
                    {index < infoRows.length - 1 && (
                      <div className="mx-6 h-px bg-border" />
                    )}
                  </div>
                ))}

                <div className="pb-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Account actions */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="px-6 pt-5 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {t.account}
                  </p>
                </div>

                {actionRows.map((action, index) => (
                  <div key={action.label}>
                    <button
                      id={action.id}
                      onClick={() => navigate(action.href)}
                      className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-muted/60 active:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                          <action.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {action.label}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {index < actionRows.length - 1 && (
                      <div className="mx-6 h-px bg-border" />
                    )}
                  </div>
                ))}

                <div className="pb-2" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
