import React, { useEffect } from 'react';
import InfoLayout from '@/components/layout/InfoLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Users, Zap, Check, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const About: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    document.title = en ? "About Us - Kibegi" : "Kuhusu Sisi - Kibegi";
    window.scrollTo(0, 0);
  }, [en]);

  const values = [
    {
      icon: ShieldCheck,
      title: en ? 'Secure by design' : 'Salama kwa muundo',
      desc: en ? 'Your data and study materials are encrypted and safely stored. You have full control over who sees your class files.' : 'Data na nyenzo zako za masomo zimesimbwa na kuhifadhiwa salama. Una udhibiti kamili wa nani anaona faili za darasa lako.',
      color: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary'
    },
    {
      icon: Users,
      title: en ? 'Community driven' : 'Inaendeshwa na jamii',
      desc: en ? 'We believe learning is collaborative. Kibegi is built to make sharing between classmates effortless and organized.' : 'Tunaamini kujifunza ni kushirikiana. Kibegi imeundwa kufanya kushirikiana kati ya wanafunzi iwe rahisi na kupangwa.',
      color: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400'
    },
    {
      icon: Zap,
      title: en ? 'Lightning fast' : 'Haraka kama radi',
      desc: en ? 'Optimized for speed and low data usage, ensuring you can access your notes even on slower mobile networks.' : 'Imeboreshwa kwa kasi na matumizi madogo ya data, kuhakikisha unaweza kupata notes zako hata kwenye mtandao hafifu.',
      color: 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      icon: MapPin,
      title: en ? 'Tanzania first' : 'Tanzania kwanza',
      desc: en ? 'Proudly built in Tanzania by camelTech, specifically designed for the needs of East African students and universities.' : 'Imejengwa kwa fahari Tanzania na camelTech, iliyoundwa maalum kwa mahitaji ya wanafunzi na vyuo vikuu vya Afrika Mashariki.',
      color: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary'
    }
  ];

  const whyItems = en ? [
    'No more endless scrolling in WhatsApp groups for old PDFs',
    'Separates academic files from personal photos and chats',
    'Works seamlessly across your phone, tablet, and laptop',
    'Timetable and reminders keep you ahead of assignments',
    'Completely free for individual student use'
  ] : [
    'Hakuna tena kutafuta PDFs za zamani kwenye magroup ya WhatsApp',
    'Inatenganisha faili za shule na picha au chati binafsi',
    'Inafanya kazi vizuri kwenye simu, tablet, na laptop yako',
    'Ratiba na vikumbusho vinakusaidia kumaliza kazi kwa wakati',
    'Bure kabisa kwa matumizi ya mwanafunzi binafsi'
  ];

  return (
    <InfoLayout
      title={en ? 'About Kibegi' : 'Kuhusu Kibegi'}
      eyebrow={en ? 'Our Story' : 'Simulizi Yetu'}
      description={
        en
          ? 'Kibegi is your digital school bag — a secure platform for students to store, share, and organize study materials.'
          : 'Kibegi ni mfuko wako wa shule wa kidijitali — jukwaa salama kwa wanafunzi kuhifadhi, kushiriki, na kupanga nyenzo za masomo.'
      }
    >
      <section className="py-8 border-t border-border">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MISSION CARD */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <div className="border border-border rounded-[26px] bg-card p-8 md:p-10 shadow-sm h-full flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">{en ? 'Mission' : 'Dhamira'}</p>
                <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-foreground leading-[1.1] mb-5">
                  {en ? 'Bridging learning and the digital era' : 'Kuziba pengo kati ya elimu na zama za kidijitali'}
                </h2>
                <p className="text-[16px] text-muted-foreground leading-relaxed">
                  {en
                    ? 'Kibegi is designed to bridge the gap between traditional learning and the digital era. Our mission is to provide students and lecturers with a seamless, secure, and organized platform for sharing study materials and collaborating within class communities. We believe every student deserves a calm, organized study workflow — not a chaotic scramble across WhatsApp, Google Drive, and random phone folders.'
                    : 'Kibegi imeundwa ili kuziba pengo kati ya mfumo wa elimu wa asili na zama za kidijitali. Dhamira yetu ni kutoa jukwaa rahisi, salama, na lililopangwa kwa wanafunzi na waalimu kushiriki nyenzo za masomo na kushirikiana ndani ya madarasa. Tunaamini kila mwanafunzi anastahili mtiririko wa masomo tulivu na uliopangwa — si msukosuko wa kutafuta kwenye WhatsApp, Google Drive, na folda za nasibu za simu.'}
                </p>
              </div>
            </motion.div>

            {/* STORY CARD */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="border border-border rounded-[26px] bg-card p-8 md:p-10 shadow-sm h-full flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">{en ? 'The story' : 'Simulizi'}</p>
                <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-foreground leading-[1.1] mb-5">
                  {en ? 'Your digital school bag' : 'Mfuko wako wa shule wa kidijitali'}
                </h2>
                <p className="text-[16px] text-muted-foreground leading-relaxed">
                  {en
                    ? '"Kibegi" means "small bag" in Swahili — and that\'s exactly what we built. A digital school bag where every note, handout, past paper, and revision pack has its place. No more heavy physical files. No more lost lecture notes. Everything you need for your academic journey fits right in your pocket, organized by class and subject, accessible anywhere.'
                    : '"Kibegi" inamaanisha "mfuko mdogo" kwa Kiswahili — na hiyo ndiyo hasa tuliyoijenga. Mfuko wa shule wa kidijitali ambapo kila note, handout, past paper, na revision pack ina mahali pake. Hakuna tena faili nzito za kimwili. Hakuna tena maelezo ya mihadhara yaliyopotea. Kila kitu unachohitaji kwa safari yako ya masomo kinatoshea mfukoni kwako, kimepangwa kwa darasa na somo, kinapatikana popote.'}
                </p>
                <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary">
                  <Heart className="h-4 w-4 text-orange-400" />
                  {en ? 'Powered by camelTech · Made in Tanzania' : 'Inayoendeshwa na camelTech · Imetengenezwa Tanzania'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/20 border-y border-border">
        <div className="wrap">
          <div className="max-w-[680px] mx-auto text-center mb-16">
            <div className="text-sm font-bold uppercase tracking-widest text-primary">{en ? 'Our values' : 'Maadili yetu'}</div>
            <h2 className="text-[clamp(28px,3.8vw,42px)] font-extrabold tracking-[-0.035em] mt-3 text-foreground leading-[1.1]">
              {en ? 'What drives us forward' : 'Kinachotusukuma mbele'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="border border-border rounded-[22px] bg-card p-7 shadow-sm hover:shadow-md hover:border-border/80 transition-all flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${v.color}`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-[18px] font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="wrap max-w-[800px]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="border border-primary/20 dark:border-primary/20 rounded-[26px] bg-[radial-gradient(120%_140%_at_50%_-20%,theme(colors.primary/0.08),transparent_60%)] bg-card p-10 text-center shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">{en ? 'Why choose Kibegi' : 'Kwa nini uchague Kibegi'}</p>
              <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold tracking-tight text-foreground mb-8">
                {en ? 'Built for the student experience' : 'Imejengwa kwa uzoefu wa mwanafunzi'}
              </h2>
              
              <ul className="flex flex-col gap-4 items-start max-w-[500px] mx-auto text-left mb-10">
                {whyItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-[15.5px] text-foreground/80 font-medium">
                    <span className="w-6 h-6 rounded-md bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="inline-flex items-center gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {en ? 'Create free account' : 'Tengeneza akaunti ya bure'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </InfoLayout>
  );
};

export default About;
