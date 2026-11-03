import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileClock,
  FileText,
  FolderOpen,
  GraduationCap,
  Loader2,
  Share2,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import fileService, { FileData } from "@/services/fileService";
import classService, { ClassData } from "@/services/classService";
import scheduleService, { ScheduleEvent, WeekdayName } from "@/services/scheduleService";
import { CalendarEvent } from "@/lib/ics";
import marketplaceService, { Listing } from "@/services/marketplaceService";
import { ShoppingBag, Tag } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TodayItem {
  id: string;
  title: string;
  description: string;
  meta: string;
  tone: "class" | "share" | "reminder";
}

interface DashboardScheduleEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  days?: WeekdayName[];
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  location?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [myFilesCount, setMyFilesCount] = useState(0);
  const [myClassesCount, setMyClassesCount] = useState(0);
  const [sharedWithMeCount, setSharedWithMeCount] = useState(0);
  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [myClasses, setMyClasses] = useState<ClassData[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileData[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<DashboardScheduleEvent[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    if (user) {
      void fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
            const [myUploadsResponse, classesResponse, sharedResponse, allFilesResponse, listingsResponse] = await Promise.all([
        fileService.getMyUploads().catch(() => ({ data: [] })),
        classService.listClasses({ page: 1, page_size: 100 }).catch(() => ({ results: [], data: [] })),
        fileService.getSharedWithMe().catch(() => ({ data: [] })),
                fileService.getAllFiles().catch(() => ({ data: [] })),
        marketplaceService.getListings().catch(() => []),
      ]);

      const myUploads = Array.isArray(myUploadsResponse.data) ? myUploadsResponse.data : [];
      const activeUploads = myUploads.filter((file) => !file.is_deleted);
      const classes = normalizeClasses(classesResponse);
      const incomingSharedFiles = Array.isArray(sharedResponse.data) ? sharedResponse.data : [];
      const allFiles = Array.isArray(allFilesResponse.data) ? allFilesResponse.data : [];

      const sortedRecentFiles = allFiles
        .filter((file) => !file.is_deleted)
        .sort((a, b) => getMostRecentTimestamp(b) - getMostRecentTimestamp(a))
        .slice(0, 8);

      setMyFilesCount(activeUploads.length);
      setMyClassesCount(classes.length);
      setSharedWithMeCount(incomingSharedFiles.length);
      setRecentFiles(sortedRecentFiles);
      setMyClasses(classes);
      setSharedFiles(incomingSharedFiles);
      setScheduleEvents(await loadDashboardScheduleEvents());
    } catch (error: any) {
      toast({
        title: language === "en" ? "Failed to load dashboard" : "Imeshindwa kupakia dashibodi",
        description:
          error.response?.data?.message ||
          (language === "en"
            ? "Could not load your student workspace right now."
            : "Haikuweza kupakia eneo lako la masomo kwa sasa."),
        variant: "destructive",
      });
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const greeting = getGreeting(language);

  const todayEvents = useMemo(() => {
    return scheduleEvents
      .filter((event) => eventOccursOnDate(event, new Date()))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [scheduleEvents]);

  const latestSharedToday = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return sharedFiles
      .filter((file) => (file.shared_at ? new Date(file.shared_at).getTime() >= oneDayAgo : false))
      .slice(0, 2);
  }, [sharedFiles]);

  const nextUpcomingClass = useMemo(() => {
    const now = new Date();
    const upcoming = scheduleEvents
      .map((event) => ({
        event,
        nextOccurrence: getNextOccurrenceStart(event, now),
      }))
      .filter((item): item is { event: DashboardScheduleEvent; nextOccurrence: Date } => Boolean(item.nextOccurrence))
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())[0];

    if (!upcoming) return null;

    return {
      ...upcoming.event,
      startDate: upcoming.nextOccurrence,
      endDate: getOccurrenceEnd(upcoming.event, upcoming.nextOccurrence),
    };
  }, [scheduleEvents]);

  const todayItems = useMemo<TodayItem[]>(() => {
    const items: TodayItem[] = [];

    todayEvents.slice(0, 2).forEach((event, index) => {
      items.push({
        id: `class-${index}-${event.title}`,
        title: event.title,
        description:
          language === "en"
            ? "Class scheduled today"
            : "Somo limepangwa leo",
        meta: `${formatTime(event.startDate, language)} - ${formatTime(event.endDate, language)}`,
        tone: "class",
      });
    });

    latestSharedToday.forEach((file) => {
      items.push({
        id: `file-${file.id}`,
        title: file.file_name,
        description:
          language === "en"
            ? `Shared by ${file.shared_by?.full_name || file.shared_by?.email || "your class"}`
            : `Imeshirikiwa na ${file.shared_by?.full_name || file.shared_by?.email || "darasa lako"}`,
        meta: formatRelativeTime(file.shared_at || file.uploaded_at, language),
        tone: "share",
      });
    });

    if (!items.length && myClassesCount > 0) {
      items.push({
        id: "reminder-join",
        title: language === "en" ? "Your study space is ready" : "Eneo lako la masomo liko tayari",
        description:
          language === "en"
            ? "Open your files or classes to continue where you left off."
            : "Fungua faili zako au madarasa yako kuendelea ulipoishia.",
        meta: language === "en" ? "Recommended next step" : "Hatua inayopendekezwa",
        tone: "reminder",
      });
    }

    return items;
  }, [todayEvents, latestSharedToday, myClassesCount, language]);

  const summaryText = useMemo(() => {
    const parts = [
      language === "en"
        ? `${myFilesCount} ${myFilesCount === 1 ? "file" : "files"}`
        : `${myFilesCount} faili`,
      language === "en"
        ? `${myClassesCount} ${myClassesCount === 1 ? "class" : "classes"}`
        : `${myClassesCount} darasa`,
    ];

    if (todayEvents.length > 0) {
      parts.push(
        language === "en"
          ? `${todayEvents.length} scheduled today`
          : `${todayEvents.length} yamepangwa leo`
      );
    } else {
      parts.push(language === "en" ? "Nothing scheduled today" : "Hakuna kilichopangwa leo");
    }

    return parts.join(" · ");
  }, [language, myFilesCount, myClassesCount, todayEvents.length]);

  const stats = [
    {
      title: language === "en" ? "My Files" : "Faili Zangu",
      value: myFilesCount,
      hint: language === "en" ? "Stored study materials" : "Vifaa vya masomo vilivyohifadhiwa",
      icon: FileText,
      action: () => navigate("/files"),
      tone: "from-cyan-50 via-white to-white dark:from-primary/10 dark:via-card dark:to-muted/30",
      accent: "bg-primary/10 text-primary",
    },
    {
      title: language === "en" ? "My Classes" : "Madarasa Yangu",
      value: myClassesCount,
      hint: language === "en" ? "Joined communities" : "Jumuiya ulizojiunga nazo",
      icon: GraduationCap,
      action: () => navigate("/classes"),
      tone: "from-violet-50 via-white to-white dark:from-violet-500/10 dark:via-card dark:to-muted/30",
      accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    {
      title: language === "en" ? "Shared With Me" : "Zilizoshirikiwa Nami",
      value: sharedWithMeCount,
      hint: language === "en" ? "Incoming resources" : "Rasilimali zinazoingia",
      icon: Share2,
      action: () => navigate("/files?tab=shared"),
      tone: "from-emerald-50 via-white to-white dark:from-emerald-500/10 dark:via-card dark:to-muted/30",
      accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
  ];

  const actionBarItems = [
    {
      label: language === "en" ? "Upload File" : "Pakia Faili",
      icon: Upload,
      action: () => navigate("/upload"),
      variant: "hero" as const,
    },
    {
      label: language === "en" ? "Join Class" : "Jiunge na Darasa",
      icon: Users,
      action: () => navigate("/classes"),
      variant: "outline" as const,
    },
    {
      label: language === "en" ? "Create Timetable" : "Unda Ratiba",
      icon: CalendarDays,
      action: () => navigate("/schedule"),
      variant: "outline" as const,
    },
  ];

  const mobileActionBarItems = actionBarItems.slice(0, 2);

  const recentFilesEmptyTitle =
    language === "en" ? "You don’t have any study materials yet" : "Bado huna vifaa vya masomo";
  const recentFilesEmptyDescription =
    language === "en"
      ? "Upload your first file or join a class to start building your digital study space."
      : "Pakia faili yako ya kwanza au jiunge na darasa kuanza kujenga eneo lako la kidijitali la masomo.";

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={(user?.user_type as "student" | "lecturer") || "student"}
        userName={user?.full_name || user?.email || "User"}
      />

      <main className="container max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6 md:space-y-8"
        >
          <motion.section
            variants={fadeUp}
            className="rounded-[30px] border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-sm md:p-8"
          >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  {greeting}, {firstName} 👋
                </h1>

                <div className="hidden md:flex gap-3">
                  {actionBarItems.map((item) => (
                    <Button
                      key={`desktop-${item.label}`}
                      variant={item.variant}
                      onClick={item.action}
                      className={`h-auto justify-start rounded-2xl px-5 py-3 text-left shadow-sm ${
                        item.variant === "hero"
                          ? "shadow-primary/20"
                          : "border border-border/70 bg-card/85 text-foreground"
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
          </motion.section>

          <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {language === "en" ? "Today" : "Leo"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {language === "en"
                        ? "See what matters today before you dive into your files."
                        : "Ona kinachohitaji umakini leo kabla hujaingia kwenye faili zako."}
                    </CardDescription>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <BellRing className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDashboard ? (
                  <div className="flex min-h-[180px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : todayItems.length > 0 ? (
                  <div className="space-y-3">
                    {todayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 rounded-2xl border border-border/70 bg-muted/60 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div
                          className={`rounded-2xl p-3 ${
                            item.tone === "class"
                              ? "bg-cyan-50 text-primary"
                              : item.tone === "share"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          {item.tone === "class" ? (
                            <CalendarDays className="h-5 w-5" />
                          ) : item.tone === "share" ? (
                            <Share2 className="h-5 w-5" />
                          ) : (
                            <Sparkles className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            {item.meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title={language === "en" ? "No classes or shared files for today" : "Hakuna masomo au faili zilizoshirikiwa leo"}
                    description={
                      language === "en"
                        ? "Create your timetable or join a class to make this dashboard feel more alive."
                        : "Unda ratiba yako au jiunge na darasa ili dashibodi hii iwe hai zaidi."
                    }
                    actions={[
                      {
                        label: language === "en" ? "Create Timetable" : "Unda Ratiba",
                        action: () => navigate("/schedule"),
                      },
                      {
                        label: language === "en" ? "Join Class" : "Jiunge na Darasa",
                        action: () => navigate("/classes"),
                        variant: "outline",
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {language === "en" ? "Timetable Preview" : "Muhtasari wa Ratiba"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {language === "en"
                        ? "A compact view of what is coming up in your week."
                        : "Muonekano mfupi wa kile kinachokuja kwenye wiki yako."}
                    </CardDescription>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Clock3 className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleEvents.length > 0 ? (
                  <>
                    {nextUpcomingClass ? (
                      <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                          {language === "en" ? "Next up" : "Kinachofuata"}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{nextUpcomingClass.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatTime(nextUpcomingClass.startDate, language)} - {formatTime(nextUpcomingClass.endDate, language)}
                        </p>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-7 gap-2">
                      {dayLabels.map((day, index) => {
                        const code = dayCodes[(index + 1) % 7];
                        const count = scheduleEvents.filter((event) => eventOccursOnWeekdayCode(event, code)).length;
                        const isToday = code === dayCodes[new Date().getDay()];
                        return (
                          <div
                            key={day}
                            className={`rounded-2xl border p-3 text-center ${
                              isToday
                                ? "border-primary/20 bg-primary/10"
                                : "border-border/70 bg-muted/60"
                            }`}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {day}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                    <Button variant="outline" className="w-full rounded-2xl" onClick={() => navigate("/schedule")}>
                      {language === "en" ? "Open Timetable" : "Fungua Ratiba"}
                    </Button>
                  </>
                ) : (
                  <EmptyState
                    compact
                    icon={CalendarDays}
                    title={language === "en" ? "No timetable yet" : "Bado hakuna ratiba"}
                    description={
                      language === "en"
                        ? "Create a timetable to see your classes and study rhythm here."
                        : "Unda ratiba ili kuona masomo yako na mpangilio wa wiki hapa."
                    }
                    actions={[
                      {
                        label: language === "en" ? "Create Timetable" : "Unda Ratiba",
                        action: () => navigate("/schedule"),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </motion.section>

          



          <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {language === "en" ? "Recent Files" : "Faili za Hivi Karibuni"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {language === "en"
                        ? "Your most relevant materials, shared resources, and recent uploads."
                        : "Vifaa vyako muhimu zaidi, rasilimali zilizoshirikiwa, na upakiaji wa hivi karibuni."}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/files")}>
                    {language === "en" ? "View All" : "Tazama Zote"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDashboard ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentFiles.length > 0 ? (
                  <div className="space-y-3">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{file.file_name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{file.source === "shared" ? (language === "en" ? "Shared file" : "Faili iliyoshirikiwa") : (language === "en" ? "Your upload" : "Upakiaji wako")}</span>
                              <span>•</span>
                              <span>
                                {file.source === "shared"
                                  ? file.shared_by?.full_name || file.shared_by?.email || (language === "en" ? "Classmate" : "Mwanafunzi mwenzako")
                                  : file.owner?.full_name || file.owner?.email || firstName}
                              </span>
                              <span>•</span>
                              <span>{formatRelativeTime(getMostRecentDateString(file), language)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="rounded-full px-3 py-1">
                            {getFileTypeLabel(file)}
                          </Badge>
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/files")}>
                            {language === "en" ? "Open" : "Fungua"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FolderOpen}
                    title={recentFilesEmptyTitle}
                    description={recentFilesEmptyDescription}
                    actions={[
                      {
                        label: language === "en" ? "Upload File" : "Pakia Faili",
                        action: () => navigate("/upload"),
                      },
                      {
                        label: language === "en" ? "Join Class" : "Jiunge na Darasa",
                        action: () => navigate("/classes"),
                        variant: "outline",
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {language === "en" ? "Your Classes" : "Madarasa Yako"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {language === "en"
                        ? "The communities, subjects, and study groups that matter to you now."
                        : "Jumuiya, masomo, na vikundi vya kujifunza vinavyokuhusu sasa."}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/classes")}>
                    {language === "en" ? "See Classes" : "Tazama Madarasa"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDashboard ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : myClasses.length > 0 ? (
                  <div className="space-y-3">
                    {myClasses.slice(0, 2).map((classItem) => (
                      <div
                        key={classItem.id}
                        className="rounded-2xl border border-border/70 bg-muted/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{classItem.name}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{classItem.member_count} {language === "en" ? "members" : "wanachama"}</span>
                              <span>•</span>
                              <span>{language === "en" ? "Updated" : "Imesasishwa"} {formatRelativeTime(classItem.updated_at || classItem.created_at, language)}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/5">
                            {classItem.class_code}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {classItem.is_verified
                              ? language === "en" ? "Verified class" : "Darasa lililothibitishwa"
                              : language === "en" ? "Study group" : "Kikundi cha masomo"}
                          </div>
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/classes/${classItem.id}`)}>
                            {language === "en" ? "Open Class" : "Fungua Darasa"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    compact
                    icon={GraduationCap}
                    title={language === "en" ? "You haven’t joined any classes yet" : "Bado hujajiunga na darasa lolote"}
                    description={
                      language === "en"
                        ? "Join your first class to unlock shared files, group learning, and class updates."
                        : "Jiunge na darasa lako la kwanza ili kufungua faili zilizoshirikiwa, kujifunza kwa pamoja, na taarifa za darasa."
                    }
                    actions={[
                      {
                        label: language === "en" ? "Join Your First Class" : "Jiunge na Darasa la Kwanza",
                        action: () => navigate("/classes"),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={fadeUp}>
            <Card className="rounded-[30px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {language === "en" ? "Marketplace Picks" : "Chaguo la Soko"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {language === "en"
                        ? "Discover study materials and items from other students."
                        : "Gundua vifaa vya kujifunza na bidhaa kutoka kwa wanafunzi wengine."}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/marketplace")}>
                    {language === "en" ? "Visit Market" : "Tembelea Soko"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDashboard ? (
                  <div className="flex min-h-[140px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentListings.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {recentListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/50 p-3 transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                        onClick={() => navigate("/marketplace")}
                      >
                        <div className="aspect-[4/3] rounded-xl bg-muted/80 overflow-hidden flex items-center justify-center relative">
                          {listing.image_url ? (
                            <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                          )}
                          <div className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm border border-border/50">
                            Tsh {parseInt(listing.price).toLocaleString()}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-1">
                          <p className="truncate font-semibold text-foreground text-sm">{listing.title}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <span className="truncate">{listing.category_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    compact
                    icon={ShoppingBag}
                    title={language === "en" ? "Marketplace is quiet" : "Soko liko kimya"}
                    description={
                      language === "en"
                        ? "No items listed yet. Be the first to sell your study materials!"
                        : "Hakuna bidhaa bado. Kuwa wa kwanza kuuza vifaa vyako vya masomo!"
                    }
                    actions={[
                      {
                        label: language === "en" ? "Go to Marketplace" : "Nenda Sokoni",
                        action: () => navigate("/marketplace"),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </motion.section>


          <motion.section variants={fadeUp}>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <button
                  key={stat.title}
                  onClick={stat.action}
                  className={`rounded-[26px] border border-border/70 bg-gradient-to-br ${stat.tone} p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                      <p className="mt-2 text-3xl font-black tracking-tight text-foreground">{stat.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
                    </div>
                    <div className={`rounded-2xl p-3 shadow-sm ${stat.accent}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};

function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  compact = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions: Array<{ label: string; action: () => void; variant?: "default" | "outline" }>;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-10"}`}>
      <div className="rounded-3xl bg-primary/10 p-4 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant === "outline" ? "outline" : "hero"}
            className="rounded-2xl"
            onClick={action.action}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function normalizeClasses(payload: any): ClassData[] {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function loadDashboardScheduleEvents(): Promise<DashboardScheduleEvent[]> {
  try {
    const calendars = await scheduleService.listCalendars();
    const details = await Promise.all(
      calendars.map((calendar) => scheduleService.getCalendar(calendar.id).catch(() => null)),
    );

    const mapped = details
      .flatMap((detail) => detail?.events || [])
      .map(mapScheduleEvent)
      .filter((event): event is DashboardScheduleEvent => Boolean(event))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (mapped.length > 0) return mapped;
  } catch {
    // Fall back to the legacy local timetable store if schedule APIs are unavailable.
  }

  return readLegacyScheduleEvents();
}

function mapScheduleEvent(event: ScheduleEvent): DashboardScheduleEvent | null {
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  return {
    id: String(event.id),
    title: event.title,
    startDate,
    endDate,
    days: event.days,
    recurrence: event.recurrence,
    location: event.location,
  };
}

function readLegacyScheduleEvents(): DashboardScheduleEvent[] {
  try {
    const raw = localStorage.getItem("kalendafy_student_timetable");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((event: any) => ({
      id: String(event.id || event.title || crypto.randomUUID()),
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }));
  } catch {
    return [];
  }
}

function eventOccursOnDate(event: DashboardScheduleEvent, date: Date) {
  const weekday = weekdayNameFromDate(date);

  if (event.recurrence === "daily") {
    return dateOnly(date).getTime() >= dateOnly(event.startDate).getTime();
  }

  if (event.recurrence === "weekly") {
    if (!event.days?.length) return false;
    return dateOnly(date).getTime() >= dateOnly(event.startDate).getTime() && event.days.includes(weekday);
  }

  if (event.recurrence === "monthly") {
    return (
      dateOnly(date).getTime() >= dateOnly(event.startDate).getTime() &&
      date.getDate() === event.startDate.getDate()
    );
  }

  return isSameCalendarDate(event.startDate, date);
}

function eventOccursOnWeekdayCode(event: DashboardScheduleEvent, code: (typeof dayCodes)[number]) {
  const weekday = weekdayNameFromCode(code);

  if (event.recurrence === "daily") return true;
  if (event.recurrence === "weekly") return Boolean(event.days?.includes(weekday));
  if (event.recurrence === "monthly" || event.recurrence === "none" || !event.recurrence) {
    return dayCodeFromDate(event.startDate) === code;
  }
  return false;
}

function getNextOccurrenceStart(event: DashboardScheduleEvent, now: Date): Date | null {
  const durationMs = Math.max(event.endDate.getTime() - event.startDate.getTime(), 0);

  if (!event.recurrence || event.recurrence === "none") {
    return event.endDate.getTime() >= now.getTime() ? event.startDate : null;
  }

  if (event.recurrence === "daily") {
    for (let offset = 0; offset < 14; offset += 1) {
      const candidate = withTime(addDays(dateOnly(now), offset), event.startDate);
      if (candidate.getTime() < event.startDate.getTime()) continue;
      if (candidate.getTime() + durationMs >= now.getTime()) return candidate;
    }
    return null;
  }

  if (event.recurrence === "weekly") {
    for (let offset = 0; offset < 21; offset += 1) {
      const day = addDays(dateOnly(now), offset);
      const weekday = weekdayNameFromDate(day);
      if (!event.days?.includes(weekday)) continue;
      const candidate = withTime(day, event.startDate);
      if (candidate.getTime() < event.startDate.getTime()) continue;
      if (candidate.getTime() + durationMs >= now.getTime()) return candidate;
    }
    return null;
  }

  if (event.recurrence === "monthly") {
    let year = now.getFullYear();
    let month = now.getMonth();

    for (let index = 0; index < 12; index += 1) {
      const candidate = buildMonthlyOccurrence(event.startDate, year, month);
      if (candidate && candidate.getTime() + durationMs >= now.getTime() && candidate.getTime() >= event.startDate.getTime()) {
        return candidate;
      }
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  return null;
}

function getOccurrenceEnd(event: DashboardScheduleEvent, occurrenceStart: Date) {
  const durationMs = Math.max(event.endDate.getTime() - event.startDate.getTime(), 0);
  return new Date(occurrenceStart.getTime() + durationMs);
}

function buildMonthlyOccurrence(source: Date, year: number, month: number) {
  const candidate = new Date(year, month, source.getDate(), source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
  if (candidate.getMonth() !== month) return null;
  return candidate;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function withTime(date: Date, sourceTime: Date) {
  const next = new Date(date);
  next.setHours(sourceTime.getHours(), sourceTime.getMinutes(), sourceTime.getSeconds(), sourceTime.getMilliseconds());
  return next;
}

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameCalendarDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function weekdayNameFromDate(date: Date): WeekdayName {
  return weekdayNameFromCode(dayCodeFromDate(date));
}

function dayCodeFromDate(date: Date): (typeof dayCodes)[number] {
  return dayCodes[date.getDay()];
}

function weekdayNameFromCode(code: (typeof dayCodes)[number]): WeekdayName {
  switch (code) {
    case "MO":
      return "monday";
    case "TU":
      return "tuesday";
    case "WE":
      return "wednesday";
    case "TH":
      return "thursday";
    case "FR":
      return "friday";
    case "SA":
      return "saturday";
    default:
      return "sunday";
  }
}

function getGreeting(language: string) {
  const hour = new Date().getHours();
  if (language === "sw") {
    if (hour < 12) return "Habari za asubuhi";
    if (hour < 17) return "Habari za mchana";
    return "Habari za jioni";
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getMostRecentTimestamp(file: FileData) {
  return new Date(getMostRecentDateString(file)).getTime();
}

function getMostRecentDateString(file: FileData) {
  if (file.shared_at && new Date(file.shared_at) > new Date(file.uploaded_at)) {
    return file.shared_at;
  }
  return file.uploaded_at;
}

function formatRelativeTime(dateString: string, language: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return language === "en" ? "Just now" : "Hivi karibuni";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return language === "en" ? `${minutes}m ago` : `Dakika ${minutes} zilizopita`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return language === "en" ? `${hours}h ago` : `Saa ${hours} zilizopita`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return language === "en" ? `${days}d ago` : `Siku ${days} zilizopita`;
  }
  return date.toLocaleDateString(language === "sw" ? "sw-TZ" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date, language: string) {
  return date.toLocaleTimeString(language === "sw" ? "sw-TZ" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFileTypeLabel(file: FileData) {
  const fromType = file.file_type?.trim();
  if (fromType) return fromType.toUpperCase();
  return file.file_name.split(".").pop()?.toUpperCase() || "FILE";
}

export default Dashboard;
