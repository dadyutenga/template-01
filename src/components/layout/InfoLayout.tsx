import React from 'react';
import Navbar from './Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface InfoLayoutProps {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
}

const InfoLayout: React.FC<InfoLayoutProps> = ({ children, title, eyebrow, description }) => {
  const { language } = useLanguage();
  const en = language === 'en';

  const copy = {
    footerDescription: en
      ? 'A secure, organized digital school bag built for East African students and lecturers.'
      : 'Mfuko wa shule wa kidijitali salama na uliopangwa, uliojengwa kwa wanafunzi na waalimu Afrika Mashariki.',
    footerProductTitle: en ? 'Product' : 'Bidhaa',
    footerCompanyTitle: en ? 'Company' : 'Kampuni',
    footerSupportTitle: en ? 'Support' : 'Usaidizi',
    footerCopyright: en ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.',
    footerPoweredBy: en ? 'Powered by' : 'Inaendeshwa na',
    footerProductLinks: [
      { label: en ? 'Features' : 'Vipengele', href: '/#features' },
      { label: en ? 'How it Works' : 'Jinsi Inavyofanya Kazi', href: '/#how' },
      { label: en ? 'Why Kibegi' : 'Kwa Nini Kibegi', href: '/#why' },
    ],
    footerCompanyLinks: [
      { label: en ? 'About Us' : 'Kuhusu Sisi', href: '/about' },
      { label: en ? 'Contact' : 'Mawasiliano', href: '/contact' },
    ],
    footerSupportLinks: [
      { label: en ? 'Help Center' : 'Kituo cha Msaada', href: '/how-to-use' },
      { label: en ? 'Privacy Policy' : 'Sera ya Faragha', href: '/privacy' },
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="[&_section]:py-8 [&_.wrap]:max-w-[1200px] [&_.wrap]:mx-auto [&_.wrap]:px-6">
        {/* HERO SECTION */}
        <section className="relative text-center pt-4 pb-2 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_-8%,theme(colors.teal.500/0.08),transparent_70%),radial-gradient(40%_40%_at_88%_12%,theme(colors.orange.500/0.07),transparent_70%)]" />
          <div className="wrap">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card rounded-full text-[11px] font-semibold text-muted-foreground shadow-sm mb-2">
                <span>{eyebrow}</span>
              </span>
            )}
            
            <h1 className="text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-[-0.03em] max-w-[16ch] mx-auto leading-[1.1] text-foreground">
               {title}
            </h1>
            
            {description && (
              <p className="text-[14px] sm:text-[15px] text-muted-foreground max-w-[580px] mx-auto mt-2 leading-relaxed font-[450]">
                {description}
              </p>
            )}
          </div>
        </section>

        {children}
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

export default InfoLayout;
