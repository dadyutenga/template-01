import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import InfoLayout from '@/components/layout/InfoLayout';
import { UserPlus, CloudUpload, Users, GraduationCap, BookOpen, Share2, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const HowToUse: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<'student' | 'lecturer'>('student');

  useEffect(() => {
    document.title = en ? "How to Use - Kibegi" : "Jinsi ya Kutumia - Kibegi";
    window.scrollTo(0, 0);
  }, [en]);

  const studentSteps = [
    { icon: UserPlus, color: 'bg-primary', title: en ? '1 · Create your bag' : '1 · Tengeneza mfuko wako', by: en ? '30 seconds, free' : 'Sekunde 30, bure', desc: en ? 'Sign up with your school email. Your personal study space is ready instantly.' : 'Jisajili kwa barua pepe ya shule. Eneo lako la masomo liko tayari papo hapo.', k1: en ? 'Setup' : 'Usanidi', v1: '0:30', k2: en ? 'Cost' : 'Gharama', v2: en ? 'Free' : 'Bure' },
    { icon: CloudUpload, color: 'bg-orange-500', title: en ? '2 · Add your materials' : '2 · Ongeza materials', by: en ? 'Notes & past papers' : 'Notes & past papers', desc: en ? 'Upload PDFs, slides, and documents. Kibegi organizes them by class and subject automatically.' : 'Pakia PDFs, slides na documents. Kibegi inazipanga kwa darasa na somo kiotomatiki.', k1: en ? 'Formats' : 'Aina', v1: 'PDF · DOC', k2: en ? 'Per upload' : 'Muda', v2: en ? 'Seconds' : 'Sekunde' },
    { icon: Users, color: 'bg-primary', title: en ? '3 · Share & revise' : '3 · Shiriki & soma', by: en ? 'With your class' : 'Na darasa lako', desc: en ? 'Join classes with a code, share resources, and pull up everything you need when exams approach.' : 'Jiunge na madarasa kwa code, shiriki rasilimali, na fungua kila kitu mitihani inapokaribia.', k1: en ? 'Join with' : 'Jiunge kwa', v1: en ? 'Code' : 'Msimbo', k2: en ? 'Access' : 'Ufikiaji', v2: '24/7' },
  ];

  const lecturerSteps = [
    { icon: GraduationCap, color: 'bg-primary', title: en ? '1 · Create a class' : '1 · Unda darasa', by: en ? 'Instant setup' : 'Papo hapo', desc: en ? 'Sign up as a lecturer and create your class to receive a unique class code for your students.' : 'Jisajili kama mwalimu na unda darasa lako ili kupata msimbo maalum kwa wanafunzi wako.', k1: en ? 'Class code' : 'Msimbo', v1: en ? 'Unique' : 'Maalum', k2: en ? 'Setup' : 'Usanidi', v2: en ? 'Instant' : 'Papo hapo' },
    { icon: BookOpen, color: 'bg-orange-500', title: en ? '2 · Upload resources' : '2 · Pakia rasilimali', by: en ? 'Handouts & notes' : 'Vipeperushi & notes', desc: en ? 'Upload handouts, assignments, and notes directly to the class library. Students see them instantly.' : 'Pakia vipeperushi na maelezo moja kwa moja kwenye maktaba ya darasa. Wanafunzi wanaona papo hapo.', k1: en ? 'File types' : 'Aina za faili', v1: 'PDF · PPT', k2: en ? 'Students see' : 'Wanafunzi', v2: en ? 'Instantly' : 'Papo hapo' },
    { icon: Share2, color: 'bg-primary', title: en ? '3 · Manage your class' : '3 · Simamia darasa', by: en ? 'All in one place' : 'Sehemu moja', desc: en ? 'Track your students, manage class resources, and keep everything in one secure, reliable place.' : 'Fuatilia wanafunzi wako, simamia rasilimali na weka kila kitu mahali pamoja salama.', k1: en ? 'Students' : 'Wanafunzi', v1: en ? 'Unlimited' : 'Bila kikomo', k2: en ? 'Storage' : 'Uhifadhi', v2: en ? 'Secure' : 'Salama' },
  ];

  const StepCard = ({ step, index }: { step: typeof studentSteps[0]; index: number }) => (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="border border-border rounded-[22px] bg-card p-6 shadow-sm hover:shadow-md hover:border-border/80 transition-all flex flex-col h-full"
    >
      <div className="flex items-center gap-3.5 mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${step.color}`}>
          <step.icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-foreground leading-tight">{step.title}</h3>
          <p className="text-[14px] text-muted-foreground mt-0.5">{step.by}</p>
        </div>
      </div>
      <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 mb-6">{step.desc}</p>
      <div className="flex justify-between border-t border-border pt-4 mt-auto">
        <div><div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{step.k1}</div><div className="text-[15px] font-bold mt-1 font-mono text-foreground">{step.v1}</div></div>
        <div className="text-right"><div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{step.k2}</div><div className="text-[15px] font-bold mt-1 font-mono text-foreground">{step.v2}</div></div>
      </div>
    </motion.div>
  );

  const activeSteps = activeTab === 'student' ? studentSteps : lecturerSteps;
  const slideDir = activeTab === 'student' ? -1 : 1;

  return (
    <InfoLayout title={en ? 'How to Use Kibegi' : 'Jinsi ya Kutumia Kibegi'} eyebrow={en ? 'Quick start guide' : 'Mwongozo wa haraka'} description={en ? 'Get started in under 30 seconds.' : 'Anza kwa chini ya sekunde 30.'}>

      {/* TABBED STEPS SECTION */}
      <section className="pt-2 pb-8 border-t border-border">
        <div className="wrap">

          {/* Tab Toggle */}
          <div className="flex justify-center mb-8">
            <div className="relative flex gap-1 p-1.5 bg-muted/60 rounded-2xl border border-border shadow-sm">
              {/* Sliding pill indicator */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-background shadow-md border border-border/60 ${activeTab === 'lecturer' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}
              />
              <button
                onClick={() => setActiveTab('student')}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors duration-200 ${activeTab === 'student' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Users className="h-4 w-4" />
                {en ? 'Student' : 'Mwanafunzi'}
              </button>
              <button
                onClick={() => setActiveTab('lecturer')}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors duration-200 ${activeTab === 'lecturer' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <GraduationCap className="h-4 w-4" />
                {en ? 'Lecturer' : 'Mwalimu'}
              </button>
            </div>
          </div>

          {/* Section Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-header'}
              initial={{ opacity: 0, y: slideDir * 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: slideDir * -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-[580px] mx-auto text-center mb-10"
            >
              <h2 className="text-[clamp(26px,3.8vw,40px)] font-extrabold tracking-[-0.035em] text-foreground leading-[1.1]">
                {activeTab === 'student' ? (en ? 'For Students' : 'Kwa Wanafunzi') : (en ? 'For Lecturers' : 'Kwa Waalimu')}
              </h2>
              <p className="text-[16px] text-muted-foreground mt-3 leading-relaxed">
                {activeTab === 'student'
                  ? (en ? 'Get your academic life organized in three simple steps.' : 'Panga maisha yako ya shule kwa hatua tatu rahisi.')
                  : (en ? 'Share resources with your class effortlessly.' : 'Shiriki rasilimali na darasa lako kwa urahisi.')}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-cards'}
              initial={{ opacity: 0, y: slideDir * 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: slideDir * -30 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {activeSteps.map((s, i) => <StepCard key={i} step={s} index={i} />)}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* PRO TIPS SECTION */}
      <section className="py-8">
        <div className="wrap max-w-[800px]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="border border-primary/20 dark:border-primary/20 rounded-[26px] bg-[radial-gradient(120%_140%_at_50%_-20%,theme(colors.primary/0.08),transparent_60%)] bg-card p-10 shadow-sm text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">{en ? 'Pro tips' : 'Vidokezo'}</p>
              <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold tracking-tight text-foreground mb-8">
                {en ? 'Get the most out of Kibegi' : 'Pata manufaa zaidi Kibegi'}
              </h2>
              <ul className="flex flex-col gap-4 items-start max-w-[500px] mx-auto text-left">
                {[
                  en ? 'Use descriptive filenames so classmates can find resources fast.' : 'Tumia majina ya kuelezea faili ili wanafunzi wenzako waweze kupata rasilimali haraka.',
                  en ? 'Organize past papers by year and subject for easier revision.' : 'Panga past papers kwa mwaka na somo kwa marudio rahisi zaidi.',
                  en ? 'Share class codes only with verified classmates.' : 'Shiriki misimbo ya darasa na wanafunzi wenzako walioidhibitishwa tu.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-[15.5px] text-foreground/80 font-medium list-none">
                    <span className="w-6 h-6 rounded-md bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="h-3.5 w-3.5" /></span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

    </InfoLayout>
  );
};

export default HowToUse;
