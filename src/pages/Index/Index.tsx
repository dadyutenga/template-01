import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CloudUpload,
  FolderOpen,
  Globe,
  GraduationCap,
  HardDrive,
  Lock,
  MessageSquareShare,
  ShieldCheck,
  Users,
  Backpack,
  FileText,
  Share2,
  UserPlus,
  X,
  Check
} from "lucide-react";
import heroImage from "@/assets/hero-photo.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const ACCOUNT_CREATED_KEY = "kibegi_account_created";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const [hasCreatedAccount, setHasCreatedAccount] = useState(false);

  useEffect(() => {
    try {
      setHasCreatedAccount(localStorage.getItem(ACCOUNT_CREATED_KEY) === "true");
    } catch (error) {
      console.error("Failed to read account created state:", error);
      setHasCreatedAccount(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      localStorage.setItem(ACCOUNT_CREATED_KEY, "true");
      setHasCreatedAccount(true);
    } catch (error) {
      console.error("Failed to save account created state:", error);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <img src="/favicon/favicon.svg" alt="Kibegi" className="h-16 w-16 animate-pulse" />
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const copy = language === "sw" ? swCopy : enCopy;
  const primaryRoute = hasCreatedAccount ? "/login" : "/signup";
  const primaryCtaLabel = hasCreatedAccount ? copy.signInCta : copy.primaryCta;
  const finalCtaButtonLabel = hasCreatedAccount ? copy.signInCta : copy.finalCtaButton;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="[&_section]:py-20 [&_.wrap]:max-w-[1200px] [&_.wrap]:mx-auto [&_.wrap]:px-6">

        {/* HERO SECTION */}
        <section className="relative text-center pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_-8%,theme(colors.teal.500/0.08),transparent_70%),radial-gradient(40%_40%_at_88%_12%,theme(colors.orange.500/0.07),transparent_70%)]" />
          <div className="wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card rounded-full text-sm font-semibold text-muted-foreground shadow-sm mb-6">
              <span className="w-5 h-5 rounded-md bg-primary inline-flex items-center justify-center text-white">
                <Backpack className="w-3 h-3" />
              </span>
              <span>{(copy as any).heroEyebrow}</span>
            </span>

            <h1 className="text-[clamp(38px,6.4vw,76px)] font-extrabold tracking-[-0.04em] max-w-[16ch] mx-auto leading-[1.05] text-foreground">
              {language === 'en' ? (
                <>Never lose <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">notes</span> again.</>
              ) : (
                <>Usipoteze tena <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">notes</span> zako.</>
              )}
            </h1>

            <p className="text-[clamp(17px,2.1vw,21px)] text-muted-foreground max-w-[620px] mx-auto mt-6 leading-relaxed font-[450]">
              {language === 'en' ? (
                <>Store <b className="text-foreground font-semibold">past papers</b>, share <b className="text-foreground font-semibold">notes</b>, and organize your <b className="text-foreground font-semibold">whole semester</b> — all in one secure place built for students.</>
              ) : (
                <>Hifadhi <b className="text-foreground font-semibold">past papers</b>, shiriki <b className="text-foreground font-semibold">notes</b>, na panga <b className="text-foreground font-semibold">semester yako yote</b> — sehemu moja salama iliyojengwa kwa wanafunzi.</>
              )}
            </p>

            <div className="flex gap-3 justify-center flex-wrap mt-8">
              <Link to={primaryRoute}>
                <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_1px_2px_theme(colors.primary/0.25),inset_0_1px_0_theme(colors.white/0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_theme(colors.primary/0.5)]">
                  {primaryCtaLabel} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/how-to-use">
                <Button variant="outline" className="h-12 px-6 rounded-xl border-border text-foreground font-semibold hover:bg-muted/30">
                  {copy.secondaryCta}
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground font-medium">{copy.heroTrust}</p>

            {/* STATS STRIP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] max-w-[860px] mx-auto mt-16 bg-border/60 border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="bg-card p-6 text-center">
                <div className="text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em] text-primary">{(copy as any).stat1n}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{(copy as any).stat1l}</div>
              </div>
              <div className="bg-card p-6 text-center">
                <div className="text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em] text-foreground">{(copy as any).stat2n}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{(copy as any).stat2l}</div>
              </div>
              <div className="bg-card p-6 text-center">
                <div className="text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em] text-foreground">{(copy as any).stat3n}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{(copy as any).stat3l}</div>
              </div>
              <div className="bg-card p-6 text-center">
                <div className="text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.03em] text-foreground">{(copy as any).stat4n}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{(copy as any).stat4l}</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section id="features" className="py-20">
          <div className="wrap">
            <div className="max-w-[680px] mx-auto text-center">
              <div className="text-sm font-bold uppercase tracking-widest text-primary">{copy.featuresEyebrow}</div>
              <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-[-0.035em] mt-3 text-foreground">{copy.featuresTitle}</h2>
              <p className="text-[clamp(16px,1.7vw,18px)] text-muted-foreground mt-4 leading-relaxed">{copy.featuresDescription}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <motion.article whileHover={{ y: -4 }} className="border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-border/80 hover:border-border transition-all">
                <div className="h-[148px] border-b border-border bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background flex items-center justify-center p-5 relative overflow-hidden">
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-sm">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-red-50 dark:bg-red-950/40 text-red-500 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                      <div className="h-2 rounded bg-border/60 flex-1"></div>
                      <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">PDF</span>
                    </div>
                    <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-sm">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                      <div className="h-2 rounded bg-border/60 flex-1"></div>
                      <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">DOCX</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center mb-3">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-[17px] font-bold tracking-tight">{copy.featureCards[2].title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{copy.featureCards[2].description}</p>
                </div>
              </motion.article>

              <motion.article whileHover={{ y: -4 }} className="border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-border/80 hover:border-border transition-all">
                <div className="h-[148px] border-b border-border bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background flex items-center justify-center p-5 relative overflow-hidden">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full border-[2.5px] border-background flex items-center justify-center text-xs font-bold text-white bg-teal-500 -ml-3 first:ml-0 shadow-sm z-10">JM</div>
                    <div className="w-10 h-10 rounded-full border-[2.5px] border-background flex items-center justify-center text-xs font-bold text-white bg-orange-500 -ml-3 shadow-sm z-20">SK</div>
                    <div className="w-10 h-10 rounded-full border-[2.5px] border-background flex items-center justify-center text-xs font-bold text-white bg-green-500 -ml-3 shadow-sm z-30">AN</div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center mb-3">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-[17px] font-bold tracking-tight">{copy.featureCards[1].title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{copy.featureCards[1].description}</p>
                </div>
              </motion.article>

              <motion.article whileHover={{ y: -4 }} className="border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-border/80 hover:border-border transition-all">
                <div className="h-[148px] border-b border-border bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background flex items-center justify-center p-5 relative overflow-hidden">
                  <div className="grid grid-cols-5 gap-1.5 w-full">
                    {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                      <div key={i} className="aspect-[1/1.15] rounded-lg border border-border bg-card flex flex-col items-center justify-center gap-1 shadow-sm">
                        <small className="text-[8px] font-bold text-muted-foreground/70 uppercase">{d}</small>
                        <div className={`h-1.5 rounded-sm ${i === 0 ? 'bg-teal-500 w-5' : i === 2 ? 'bg-orange-500 w-5' : i === 4 ? 'bg-green-500 w-5' : 'bg-border/60 w-3.5'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center mb-3">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <h3 className="text-[17px] font-bold tracking-tight">{copy.featureCards[3].title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{copy.featureCards[3].description}</p>
                </div>
              </motion.article>

              <motion.article whileHover={{ y: -4 }} className="border border-border rounded-2xl bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-border/80 hover:border-border transition-all">
                <div className="h-[148px] border-b border-border bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background flex items-center justify-center p-5 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-[0_14px_30px_-10px_theme(colors.teal.700/0.6)]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center mb-3">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-[17px] font-bold tracking-tight">{copy.featureCards[5].title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{copy.featureCards[5].description}</p>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how" className="py-20 bg-muted/20 border-y border-border">
          <div className="wrap">
            <div className="flex items-end justify-between gap-5 flex-wrap">
              <div className="max-w-[680px]">
                <div className="text-sm font-bold uppercase tracking-widest text-primary">{(copy as any).howEyebrow}</div>
                <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-[-0.035em] mt-3 text-foreground">{(copy as any).howTitle}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
              {(copy as any).howSteps.map((step: any, i: number) => {
                const Icon = i === 0 ? UserPlus : i === 1 ? CloudUpload : Users;
                const colorClass = i === 0 ? "bg-teal-500" : i === 1 ? "bg-orange-500" : "bg-green-500";
                return (
                  <motion.div key={i} whileHover={{ y: -4 }} className="border border-border rounded-2xl bg-card p-6 shadow-sm hover:shadow-md hover:border-border/80 hover:border-border transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[16.5px] font-bold text-foreground">{step.title}</h3>
                        <div className="text-sm text-muted-foreground mt-0.5">{step.by}</div>
                      </div>
                    </div>
                    <p className="text-[14.5px] text-muted-foreground mt-4 leading-relaxed">{step.desc}</p>
                    <div className="flex justify-between border-t border-border mt-5 pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground/70 font-medium">{step.k1}</div>
                        <div className="text-[15px] font-bold mt-1 font-mono tracking-tight text-foreground">{step.v1}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground/70 font-medium">{step.k2}</div>
                        <div className="text-[15px] font-bold mt-1 font-mono tracking-tight text-foreground">{step.v2}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SHOWCASE SPLIT SECTION */}
        <section id="students" className="py-20">
          <div className="wrap grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary">{copy.showcaseEyebrow}</div>
              <h2 className="text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-[-0.035em] mt-3 text-foreground leading-[1.1]">{copy.showcaseBlocks[0].title}</h2>
              <p className="text-[16.5px] text-muted-foreground mt-4 leading-relaxed">{copy.showcaseBlocks[0].description}</p>

              <div className="flex flex-col gap-3.5 mt-6">
                {copy.showcaseBlocks[0].points.map((pt: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[15px] text-foreground/80 font-medium">{pt}</span>
                  </div>
                ))}
              </div>
              <Link to={primaryRoute} className="inline-block mt-8">
                <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {primaryCtaLabel} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="border border-border rounded-[26px] bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Operating Systems · Resources</span>
                <span className="font-mono text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-md whitespace-nowrap">12 files</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl p-3 shadow-sm">
                  <div className="w-9 h-9 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 flex items-center justify-center rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">Past Paper — 2024.pdf</div>
                    <div className="text-xs text-muted-foreground truncate">Exam prep · 1.2 MB</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">PDF</span>
                </div>
                <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl p-3 shadow-sm">
                  <div className="w-9 h-9 bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 flex items-center justify-center rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">Lecture 6 — Scheduling.pptx</div>
                    <div className="text-xs text-muted-foreground truncate">Your upload · 4.8 MB</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded">PPTX</span>
                </div>
                <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl p-3 shadow-sm">
                  <div className="w-9 h-9 bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">Revision Notes — Week 6.docx</div>
                    <div className="text-xs text-muted-foreground truncate">Shared · James M.</div>
                  </div>
                  <span className="font-mono text-[9px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded">DOCX</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section id="why" className="py-20 bg-muted/20 border-y border-border">
          <div className="wrap">
            <div className="max-w-[680px] mx-auto text-center">
              <div className="text-sm font-bold uppercase tracking-widest text-primary">{copy.whyEyebrow}</div>
              <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-[-0.035em] mt-3 text-foreground">{copy.whyTitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
              <div className="rounded-[26px] p-8 border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                <h3 className="text-[21px] font-[750] text-foreground flex items-center gap-2.5">😵‍💫 {copy.messyTitle}</h3>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {copy.messyPoints.map((pt: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/80 font-medium">
                      <X className="w-[18px] h-[18px] text-rose-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[26px] p-8 border border-teal-200/70 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20">
                <h3 className="text-[21px] font-[750] text-foreground flex items-center gap-2.5">✨ {copy.kibegiWayTitle}</h3>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {copy.kibegiWayPoints.map((pt: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/80 font-medium">
                      <Check className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20">
          <div className="wrap">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border border-border rounded-[26px] bg-card bg-[radial-gradient(120%_140%_at_50%_-20%,theme(colors.teal.500/0.08),transparent_60%)] text-center px-8 py-16 shadow-md">
              <h2 className="text-[clamp(28px,3.8vw,46px)] font-extrabold tracking-[-0.04em] max-w-[18ch] mx-auto leading-[1.05] text-foreground">{copy.finalCtaTitle}</h2>
              <p className="text-[17px] text-muted-foreground max-w-[520px] mx-auto mt-4 leading-relaxed font-medium">{copy.finalCtaDescription}</p>
              <div className="mt-8 flex justify-center">
                <Link to={primaryRoute}>
                  <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {finalCtaButtonLabel} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-7">
                {copy.finalTrustItems.map((item: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-muted-foreground bg-card border border-border rounded-full px-3.5 py-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/30 pt-14 pb-8">
        <div className="wrap max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr,1fr,1fr,1fr] gap-9">
            <div>
              <div className="flex items-center gap-2.5 font-extrabold text-[19px] tracking-[-0.03em] text-foreground">
                <img src="/favicon/favicon.svg" alt="Kibegi" className="w-8 h-8 rounded-lg" />
                Kibegi
              </div>
              <p className="text-sm text-muted-foreground mt-3.5 max-w-[300px] leading-relaxed">{copy.footerDescription}</p>
            </div>

            <div>
              <h5 className="text-[12.5px] font-bold uppercase tracking-widest text-muted-foreground/70">{copy.footerProductTitle}</h5>
              <div className="flex flex-col gap-3 mt-4">
                {copy.footerProductLinks.map((link: any) => (
                  <Link key={link.href} to={link.href} className="text-[14.5px] text-muted-foreground hover:text-primary transition-colors font-medium">{link.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[12.5px] font-bold uppercase tracking-widest text-muted-foreground/70">{copy.footerCompanyTitle}</h5>
              <div className="flex flex-col gap-3 mt-4">
                {copy.footerCompanyLinks.map((link: any) => (
                  <Link key={link.href} to={link.href} className="text-[14.5px] text-muted-foreground hover:text-primary transition-colors font-medium">{link.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[12.5px] font-bold uppercase tracking-widest text-muted-foreground/70">{copy.footerSupportTitle}</h5>
              <div className="flex flex-col gap-3 mt-4">
                {copy.footerSupportLinks.map((link: any) => (
                  <Link key={link.href} to={link.href} className="text-[14.5px] text-muted-foreground hover:text-primary transition-colors font-medium">{link.label}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-border mt-11 pt-6 text-[13.5px] text-muted-foreground font-medium">
            <span>© {new Date().getFullYear()} Kibegi. {copy.footerCopyright}</span>
            <span>{copy.footerPoweredBy} <b className="text-foreground font-bold">camelTech</b></span>
          </div>
        </div>
      </footer>
    </div>
  );

};

const enCopy = {
  heroEyebrow: "Your digital school bag",
  heroTitle: "Never Lose Notes Again.",
  heroDescription:
    "Store past papers, share notes, organize your semester, and stay ahead — all in one secure digital system built for students.",
  heroBullets: [
    "Past papers in one place",
    "Smart timetable synced to your phone",
    "Share with classmates instantly",
  ],
  primaryCta: "Start Organizing",
  signInCta: "Sign In",
  secondaryCta: "See How Kibegi Works",
  heroTrust: "Takes less than 30 seconds · Free to get started",
  stat1n: "Free", stat1l: "to get started",
  stat2n: "EN · SW", stat2l: "Fully bilingual",
  stat3n: "All devices", stat3l: "Web, phone & tablet",
  stat4n: "Secure", stat4l: "Private by default",
  featuresEyebrow: "Everything you need",
  featuresTitle: "Everything You Need to Stay Ahead",
  featuresDescription: "Kibegi gives students one clean system for notes, schedules, sharing, and study organization.",
  featureCards: [
    { icon: CloudUpload, badge: "Upload", title: "Upload Notes & Past Papers in Seconds", description: "Add PDFs, documents, and revision materials without the usual folder chaos.", preview: "upload" as const },
    { icon: MessageSquareShare, badge: "Sharing", title: "Share With Your Class Instantly", description: "Send materials to classmates or class groups in just a few taps.", preview: "sharing" as const },
    { icon: FolderOpen, badge: "Structure", title: "Organize Everything by Subject", description: "Keep notes, handouts, past papers, and resources neatly grouped for faster revision.", preview: "folders" as const },
    { icon: CalendarDays, badge: "Timetable", title: "Build Your Study Timetable", description: "Create a weekly class schedule and keep your semester easier to manage.", preview: "calendar" as const },
    { icon: Globe, badge: "Access", title: "Access Materials Anywhere", description: "Open your study materials across devices whenever you need them most.", preview: "notes" as const },
    { icon: ShieldCheck, badge: "Security", title: "Private, Secure, and Reliable", description: "Your academic files stay protected, organized, and ready when you need them.", preview: "security" as const },
  ],
  howEyebrow: "How it works",
  howTitle: "Set up in three steps",
  howSteps: [
    { title: "1 · Create your bag", by: "30 seconds, free", desc: "Sign up with your school email and your personal study space is ready instantly.", k1: "Setup", v1: "0:30", k2: "Cost", v2: "Free" },
    { title: "2 · Add your materials", by: "Notes & past papers", desc: "Upload PDFs, slides and documents — Kibegi sorts them by class and subject automatically.", k1: "Formats", v1: "PDF·DOC", k2: "Per upload", v2: "Seconds" },
    { title: "3 · Share & revise", by: "With your class", desc: "Join classes with a code, share resources, and pull up everything you need when exams approach.", k1: "Join with", v1: "Code", k2: "Access", v2: "24/7" },
  ],
  whyEyebrow: "Why Kibegi",
  whyTitle: "Why Students Choose Kibegi",
  whyDescription: "Kibegi replaces scattered study workflows with one organized academic system.",
  messyTitle: "The messy way",
  messyPoints: [
    "No more WhatsApp note chaos",
    "No more lost PDFs buried in random folders",
    "No more \"send me that file again\" messages",
    "No more scattered study materials across different apps",
  ],
  kibegiWayTitle: "The Kibegi way",
  kibegiWayPoints: [
    "Everything in one place",
    "Structured per subject and class",
    "Always accessible when revision starts",
    "Better collaboration with classmates",
  ],
  showcaseEyebrow: "More than storage",
  showcaseTitle: "More Than Just File Storage",
  showcaseDescription: "Kibegi helps students manage study materials, schedules, class sharing, and campus productivity from one place.",
  showcaseBlocks: [
    {
      label: "Notes and past papers",
      title: "Build an academic library that actually makes sense",
      description: "Keep lecture notes, handouts, revision packs, and exam papers organized in one place so your semester stays searchable and calm.",
      points: ["Subject-based organization", "Fast access to revision files", "Cleaner storage for serious study"],
      preview: "folders" as const,
    },
    {
      label: "Timetable and calendar",
      title: "Plan the week around the classes that matter",
      description: "Create a study timetable that feels useful every day, with a structure you can carry into your phone and your routine.",
      points: ["Visual weekly schedule", "Built for semester planning", "Sync-friendly timetable flow"],
      preview: "calendar" as const,
    },
    {
      label: "Class sharing",
      title: "Move materials through real class communities",
      description: "From class codes to shared resources, Kibegi helps classmates exchange materials in a way that feels organized and dependable.",
      points: ["Cleaner than random chat threads", "Built for class communities", "Faster handoff of useful resources"],
      preview: "sharing" as const,
    },
  ],
  finalCtaEyebrow: "Ready to begin?",
  finalCtaTitle: "Start Organizing",
  finalCtaDescription: "Upload notes, save past papers, build your timetable, and keep your academic life in one place.",
  finalCtaButton: "Create Your Free Account",
  finalCtaHelper: "Takes less than 30 seconds",
  finalTrustItems: ["Free to get started", "Works on mobile and desktop", "Built for students"],
  footerTagline: "Your digital school bag",
  footerDescription: "Kibegi helps students store, organize, and share academic resources with a cleaner, more reliable study workflow.",
  footerProductTitle: "Product",
  footerProductLinks: [
    { label: "Home", href: "/" },
    { label: "Library", href: "/library" },
    { label: "Marketplace", href: "/marketplace" },
  ],
  footerCompanyTitle: "Company",
  footerCompanyLinks: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
  ],
  footerSupportTitle: "Get Started",
  footerSupportLinks: [
    { label: "Create Account", href: "/signup" },
    { label: "Sign In", href: "/login" },
    { label: "How to Use", href: "/how-to-use" },
  ],
  footerCopyright: "Your Digital School Bag.",
  footerPoweredBy: "Powered by:",
};

const swCopy = {
  heroEyebrow: "Mfuko wako wa shule wa kidijitali",
  heroTitle: "Usipoteze Tena Notes Zako.",
  heroDescription:
    "Hifadhi past papers, shiriki notes, panga semester yako, na songa mbele — yote ndani ya mfumo mmoja salama wa kidijitali uliotengenezwa kwa wanafunzi.",
  heroBullets: [
    "Past papers zote sehemu moja",
    "Ratiba ya masomo inayokwenda na simu yako",
    "Shiriki na wanafunzi wenzako mara moja",
  ],
  primaryCta: "Anza Kupanga",
  signInCta: "Ingia",
  secondaryCta: "Ona Jinsi Kibegi Inavyofanya Kazi",
  heroTrust: "Inachukua chini ya sekunde 30 · Ni bure kuanza",
  stat1n: "Bure", stat1l: "kuanza",
  stat2n: "EN · SW", stat2l: "Lugha mbili kamili",
  stat3n: "Vifaa vyote", stat3l: "Wavuti, simu & tableti",
  stat4n: "Salama", stat4l: "Faragha",
  featuresEyebrow: "Kila kitu unachohitaji",
  featuresTitle: "Kila Kitu Unachohitaji Kusonga Mbele",
  featuresDescription: "Kibegi inawapa wanafunzi mfumo mmoja safi wa notes, ratiba, ushirikiano, na upangaji wa masomo.",
  featureCards: [
    { icon: CloudUpload, badge: "Pakia", title: "Pakia Notes na Past Papers kwa Sekunde", description: "Ongeza PDFs, nyaraka, na vifaa vya marudio bila msukosuko wa kawaida wa folda.", preview: "upload" as const },
    { icon: MessageSquareShare, badge: "Shiriki", title: "Shiriki na Darasa Lako Mara Moja", description: "Tuma vifaa kwa wanafunzi wenzako au makundi ya darasa kwa kubonyeza chache tu.", preview: "sharing" as const },
    { icon: FolderOpen, badge: "Muundo", title: "Panga Kila Kitu kwa Somo", description: "Weka notes, vipeperushi, past papers, na rasilimali zimepangwa vizuri kwa marudio ya haraka.", preview: "folders" as const },
    { icon: CalendarDays, badge: "Ratiba", title: "Jenga Ratiba Yako ya Masomo", description: "Tengeneza ratiba ya wiki ya darasa na usimamie semester yako kwa urahisi zaidi.", preview: "calendar" as const },
    { icon: Globe, badge: "Ufikiaji", title: "Fikia Vifaa Popote Ulipo", description: "Fungua vifaa vyako vya masomo kwenye vifaa vyovyote unapovihitaji zaidi.", preview: "notes" as const },
    { icon: ShieldCheck, badge: "Usalama", title: "Faragha, Salama, na ya Kuaminika", description: "Faili zako za masomo zinabaki zinalindwa, zimepangwa, na ziko tayari unapozihitaji.", preview: "security" as const },
  ],
  howEyebrow: "Jinsi inavyofanya kazi",
  howTitle: "Anzisha kwa hatua tatu",
  howSteps: [
    { title: "1 · Tengeneza mfuko", by: "Sekunde 30, bure", desc: "Jisajili kwa barua pepe ya shule na eneo lako la masomo liko tayari papo hapo.", k1: "Usanidi", v1: "0:30", k2: "Gharama", v2: "Bure" },
    { title: "2 · Ongeza materials", by: "Notes & past papers", desc: "Pakia PDFs, slides na documents — Kibegi inazipanga kwa darasa na somo kiotomatiki.", k1: "Aina", v1: "PDF·DOC", k2: "Muda", v2: "Sekunde" },
    { title: "3 · Shiriki & soma", by: "Na darasa lako", desc: "Jiunge na madarasa kwa code, shiriki rasilimali, na fungua kila kitu unapohitaji mitihani inapokaribia.", k1: "Jiunge", v1: "Code", k2: "Ufikiaji", v2: "24/7" },
  ],
  whyEyebrow: "Kwa nini Kibegi",
  whyTitle: "Kwa Nini Wanafunzi Wanachagua Kibegi",
  whyDescription: "Kibegi inabadilisha mtiririko wa masomo ulioenea na mfumo mmoja uliopangwa wa masomo.",
  messyTitle: "Njia ya msukosuko",
  messyPoints: [
    "Hakuna msukosuko wa notes za WhatsApp tena",
    "Hakuna PDFs zilizopotea katika folda za nasibu tena",
    "Hakuna ujumbe wa \"nitumie faili hiyo tena\" tena",
    "Hakuna vifaa vya masomo vilivyoenea katika programu tofauti tena",
  ],
  kibegiWayTitle: "Njia ya Kibegi",
  kibegiWayPoints: [
    "Kila kitu mahali pamoja",
    "Imepangwa kwa somo na darasa",
    "Daima inafikiwa marudio yanapoanza",
    "Ushirikiano bora na wanafunzi wenzako",
  ],
  showcaseEyebrow: "Zaidi ya uhifadhi",
  showcaseTitle: "Zaidi ya Uhifadhi wa Faili Tu",
  showcaseDescription: "Kibegi husaidia wanafunzi kusimamia vifaa vya masomo, ratiba, ushirikiano wa darasa, na tija ya chuo kutoka mahali pamoja.",
  showcaseBlocks: [
    {
      label: "Notes na past papers",
      title: "Jenga maktaba ya masomo inayomaaniana kweli kweli",
      description: "Weka notes za mihadhara, vipeperushi, vifurushi vya marudio, na karatasi za mitihani zimepangwa mahali pamoja ili semester yako ibaki inaweza kutafutwa na kutulia.",
      points: ["Upangaji kulingana na somo", "Ufikiaji wa haraka wa faili za marudio", "Uhifadhi safi kwa masomo mazito"],
      preview: "folders" as const,
    },
    {
      label: "Ratiba na kalenda",
      title: "Panga wiki kuzunguka madarasa yanayohusika",
      description: "Tengeneza ratiba ya masomo inayohisi muhimu kila siku, na muundo unaowezesha kuibeba kwenye simu yako na utaratibu wako.",
      points: ["Ratiba ya wiki ya kuona", "Imejengwa kwa mipango ya semester", "Mtiririko wa ratiba unaofaa na usawazishaji"],
      preview: "calendar" as const,
    },
    {
      label: "Ushirikiano wa darasa",
      title: "Hamisha vifaa kupitia jamii za darasa halisi",
      description: "Kutoka kwa nambari za darasa hadi rasilimali zilizoshirikiwa, Kibegi husaidia wanafunzi kubadilishana vifaa kwa njia inayohisi iliyopangwa na ya kuaminika.",
      points: ["Safi kuliko nyuzi za mazungumzo nasibu", "Imejengwa kwa jamii za darasa", "Uhamisho wa haraka wa rasilimali muhimu"],
      preview: "sharing" as const,
    },
  ],
  finalCtaEyebrow: "Tayari kuanza?",
  finalCtaTitle: "Anza Kupanga",
  finalCtaDescription: "Pakia notes, hifadhi past papers, jenga ratiba yako, na weka maisha yako ya masomo mahali pamoja.",
  finalCtaButton: "Tengeneza Akaunti Yako Bure",
  finalCtaHelper: "Inachukua chini ya sekunde 30",
  finalTrustItems: ["Bure kuanza", "Inafanya kazi kwenye simu na kompyuta", "Imejengwa kwa wanafunzi"],
  footerTagline: "Mfuko wako wa shule wa kidijitali",
  footerDescription: "Kibegi husaidia wanafunzi kuhifadhi, kupanga, na kushiriki rasilimali za masomo kwa mtiririko wa masomo safi zaidi na wa kuaminika.",
  footerProductTitle: "Bidhaa",
  footerProductLinks: [
    { label: "Nyumbani", href: "/" },
    { label: "Maktaba", href: "/library" },
    { label: "Soko", href: "/marketplace" },
  ],
  footerCompanyTitle: "Kampuni",
  footerCompanyLinks: [
    { label: "Kuhusu", href: "/about" },
    { label: "Wasiliana", href: "/contact" },
    { label: "Faragha", href: "/privacy" },
  ],
  footerSupportTitle: "Anza",
  footerSupportLinks: [
    { label: "Tengeneza Akaunti", href: "/signup" },
    { label: "Ingia", href: "/login" },
    { label: "Jinsi ya Kutumia", href: "/how-to-use" },
  ],
  footerCopyright: "Mfuko Wako wa Shule wa Kidijitali.",
  footerPoweredBy: "Imewezeshwa na:",
};

export default Index;
