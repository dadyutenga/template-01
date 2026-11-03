import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import InfoLayout from '@/components/layout/InfoLayout';
import { Database, ShieldCheck, UserCheck, Trash2, Lock, Globe } from 'lucide-react';
import React, { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Privacy: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    document.title = en ? "Privacy Policy - Kibegi" : "Sera ya Faragha - Kibegi";
    window.scrollTo(0, 0);
  }, [en]);

  const sections = [
    {
      icon: Database,
      color: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
      title: en ? 'Data Collection' : 'Ukusanyaji wa Data',
      body: en
        ? 'We collect only the minimum information required to provide our service: your name, email address, and the files you choose to upload to your school bag. We do not collect browsing history, location data, or any information beyond what is necessary to run the platform.'
        : 'Tunakusanya taarifa za kimsingi tu zinazohitajika ili kutoa huduma yetu: jina lako, barua pepe, na faili unazochagua kupakia kwenye mkoba wako wa shule. Hatukusanyi historia ya kuvinjari, data ya eneo, au taarifa yoyote zaidi ya kinachohitajika kuendesha jukwaa.',
    },
    {
      icon: Lock,
      color: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400',
      title: en ? 'File Security' : 'Usalama wa Faili',
      body: en
        ? 'All uploaded materials are encrypted in transit and at rest. Only you and the members of the specific classes you share with can access your documents. We use industry-standard security practices to protect your academic files at all times.'
        : 'Nyenzo zote pakiwa zimewekewa usimbaji fiche wakati wa uhamishaji na wakati wa uhifadhi. Wewe tu na wanachama wa madarasa maalum unayoshiriki nao ndio wanaoweza kufikia nyaraka zako. Tunatumia mazoea ya usalama ya kiwango cha tasnia kulinda faili zako za masomo wakati wote.',
    },
    {
      icon: UserCheck,
      color: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
      title: en ? 'Your Rights' : 'Haki Zako',
      body: en
        ? 'You have the right to download, delete, or modify your information at any time through your account settings. You can request a full export of your data or permanent account deletion at any time by contacting our support team.'
        : 'Una haki ya kupakua, kufuta, au kubadilisha taarifa zako wakati wowote kupitia mipangilio ya akaunti yako. Unaweza kuomba usafirishaji kamili wa data yako au kufutwa kwa akaunti yako kwa kudumu wakati wowote kwa kuwasiliana na timu yetu ya usaidizi.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      title: en ? 'No Data Selling' : 'Hatuuzi Data',
      body: en
        ? 'We do not sell, rent, or trade your academic data to any third parties. Your study materials, notes, and personal information are yours — they will never be monetized or shared without your explicit consent.'
        : 'Hatuuzi, kukodisha, au kufanya biashara ya data yako ya kitaaluma kwa watu wengine. Vifaa vyako vya masomo, notes, na taarifa za kibinafsi ni vyako — havitawahi kutarajiwa faida au kushirikiwa bila idhini yako ya wazi.',
    },
    {
      icon: Globe,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
      title: en ? 'Data Location' : 'Mahali pa Data',
      body: en
        ? 'Your data is stored on secure servers. Kibegi is a Tanzania-first platform and we are committed to handling your data responsibly and in compliance with applicable data protection regulations.'
        : 'Data yako imehifadhiwa kwenye seva salama. Kibegi ni jukwaa la Tanzania-kwanza na tumejitolea kushughulikia data yako kwa uwajibikaji na kufuata kanuni zinazotumika za ulinzi wa data.',
    },
    {
      icon: Trash2,
      color: 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400',
      title: en ? 'Data Deletion' : 'Kufutwa kwa Data',
      body: en
        ? 'If you choose to delete your account, all your personal data and uploaded files will be permanently removed from our systems within 30 days. Class files you uploaded may remain visible to class members until the class owner removes them.'
        : 'Ukichagua kufuta akaunti yako, data yako yote ya kibinafsi na faili zilizopakiwa zitaondolewa kwa kudumu kutoka kwenye mifumo yetu ndani ya siku 30. Faili za darasa ulizoongeza zinaweza kuendelea kuonekana kwa wanachama wa darasa hadi mmiliki wa darasa azifute.',
    },
  ];

  return (
    <InfoLayout
      title={en ? 'Privacy Policy' : 'Sera ya Faragha'}
      eyebrow={en ? 'Your privacy matters' : 'Faragha yako ni muhimu'}
      description={
        en
          ? 'At Kibegi, we take your privacy seriously. This policy outlines how we collect, use, and protect your information.'
          : 'Katika Kibegi, tunachukulia faragha yako kwa uzito. Sera hii inaelezea jinsi tunavyokusanya, kutumia, na kulinda taarifa zako.'
      }
    >
      <section className="py-8 border-t border-border">
        <div className="wrap max-w-[800px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="border border-primary/20 dark:border-primary/20 rounded-[22px] bg-primary/10/40 dark:bg-primary/5 p-6 mb-12 text-center"
          >
            <p className="text-[15px] text-foreground/80 leading-relaxed font-medium">
              {en
                ? '🔒 Last updated: 2025. This policy applies to all users of kibegi.com and the Kibegi mobile application.'
                : '🔒 Ilisasishwa mwisho: 2025. Sera hii inatumika kwa watumiaji wote wa kibegi.com na programu ya simu ya Kibegi.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-border rounded-[22px] bg-card p-8 shadow-sm flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-6 ${section.color}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <h2 className="text-[19px] font-bold text-foreground mb-3 tracking-tight">{section.title}</h2>
                <p className="text-[15px] text-muted-foreground leading-relaxed flex-1">{section.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/20 border-y border-border">
        <div className="wrap max-w-[600px] text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-[22px] font-extrabold text-foreground mb-4">{en ? 'Contact Us About Privacy' : 'Wasiliana Nasi Kuhusu Faragha'}</h2>
            <p className="text-[16px] text-muted-foreground leading-relaxed mb-6">
              {en
                ? 'If you have questions about this privacy policy or how we handle your data, reach out to our team.'
                : 'Ukiwa na maswali kuhusu sera hii ya faragha au jinsi tunavyoshughulikia data yako, wasiliana na timu yetu.'}
            </p>
            <a
              href="mailto:itslugenge96@icloud.com"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-card border border-border px-8 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/30 transition-colors"
            >
              itslugenge96@icloud.com
            </a>
          </motion.div>
        </div>
      </section>
    </InfoLayout>
  );
};

export default Privacy;
