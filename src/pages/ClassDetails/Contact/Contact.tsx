import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import InfoLayout from '@/components/layout/InfoLayout';
import { Mail, MessageCircle, Github, ArrowRight, Clock } from 'lucide-react';
import React, { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    document.title = en ? "Contact Us - Kibegi" : "Wasiliana Nasi - Kibegi";
    window.scrollTo(0, 0);
  }, [en]);

  return (
    <InfoLayout
      title={en ? 'Contact Us' : 'Wasiliana Nasi'}
      eyebrow={en ? "We're here to help" : 'Tuko hapa kukusaidia'}
      description={
        en
          ? "Have a question, feedback, or issue? We'd love to hear from you. Our team usually responds within 24 hours."
          : 'Je, una swali, maoni, au tatizo? Tungependa kusikia kutoka kwako. Timu yetu kawaida hujibu ndani ya masaa 24.'
      }
    >
      <section className="py-8 border-t border-border">
        <div className="wrap max-w-[900px]">
          
          {/* RESPONSE TIME BANNER */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 border border-teal-200/60 dark:border-teal-900/40 rounded-[22px] bg-teal-50/40 dark:bg-teal-950/15 px-8 py-5 mb-14 text-center"
          >
            <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400 mx-auto sm:mx-0 flex-shrink-0" />
            <p className="text-[15px] font-medium text-foreground/80">
              {en
                ? '⚡ Average response time: within 24 hours on business days.'
                : '⚡ Muda wa wastani wa kujibu: ndani ya masaa 24 katika siku za kazi.'}
            </p>
          </motion.div>

          {/* CONTACT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EMAIL */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="border border-border rounded-[22px] bg-card p-8 shadow-sm hover:shadow-md hover:border-border/60 transition-all flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-[19px] font-bold text-foreground mb-3">{en ? 'Email Support' : 'Usaidizi kwa Barua Pepe'}</h3>
              <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed flex-1 max-w-[320px]">
                {en
                  ? 'For general questions, account help, or feature requests — email is the best way to reach us.'
                  : 'Kwa maswali ya jumla, msaada wa akaunti, au maombi ya kipengele — barua pepe ndiyo njia bora ya kuwasiliana nasi.'}
              </p>
              <a
                href="mailto:itslugenge96@icloud.com"
                className="inline-flex items-center justify-center gap-2 h-12 w-full max-w-[240px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[15px] font-semibold transition-all hover:-translate-y-0.5"
              >
                {en ? 'Send an email' : 'Tuma barua pepe'}
              </a>
              <p className="text-[13px] text-muted-foreground mt-4 font-medium">itslugenge96@icloud.com</p>
            </motion.div>

            {/* FEEDBACK */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="border border-border rounded-[22px] bg-card p-8 shadow-sm hover:shadow-md hover:border-border/60 transition-all flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-[19px] font-bold text-foreground mb-3">{en ? 'Product Feedback' : 'Maoni ya Bidhaa'}</h3>
              <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed flex-1 max-w-[320px]">
                {en
                  ? 'Found a bug? Have a great idea for a feature? We read every piece of feedback and use it to improve Kibegi.'
                  : 'Umegundua hitilafu? Una wazo zuri la kipengele? Tunasoma kila maoni na kuyatumia kuboresha Kibegi.'}
              </p>
              <a
                href="mailto:itslugenge96@icloud.com?subject=Kibegi Feedback"
                className="inline-flex items-center justify-center gap-2 h-12 w-full max-w-[240px] border border-border hover:bg-muted text-foreground rounded-xl text-[15px] font-semibold transition-all"
              >
                {en ? 'Share feedback' : 'Shiriki maoni'}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/20 border-y border-border">
        <div className="wrap max-w-[700px]">
          {/* CAMELTECH FOOTER CARD */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="border border-border rounded-[26px] bg-card p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-foreground mb-3">{en ? 'Built by camelTech' : 'Imejengwa na camelTech'}</h3>
              <p className="text-[15.5px] text-muted-foreground leading-relaxed">
                {en
                  ? 'Kibegi is a product of camelTech — a software studio building tools for the East African student community. We\'re a small team that cares deeply about education technology.'
                  : 'Kibegi ni bidhaa ya camelTech — studio ya programu inayojenga zana kwa jamii ya wanafunzi wa Afrika Mashariki. Sisi ni timu ndogo inayojali sana teknolojia ya elimu.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </InfoLayout>
  );
};

export default Contact;
