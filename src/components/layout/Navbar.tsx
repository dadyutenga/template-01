import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Globe, Moon, Sun, Languages, Calculator, Home, Info, BookOpen, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, MoreVertical } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { translations } from "@/lib/translations";

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const t = translations[language];

  const isLandingPage = location.pathname === "/";

  const navLinks = [
    { label: t.home, href: "/", icon: Home },
    { label: language === 'en' ? 'About' : 'Kuhusu Kibegi', href: "/about", icon: Info },
    { label: language === 'en' ? 'How to Use' : 'Jinsi ya Kutumia', href: "/how-to-use", icon: BookOpen },
    { label: language === 'en' ? 'Privacy' : 'Faragha', href: "/privacy", icon: ShieldCheck },
    { label: language === 'en' ? 'Contact Us' : 'Wasiliana Nasi', href: "/contact", icon: Mail },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-10 w-10" />
          <span className="text-xl font-bold text-foreground">Kibegi</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          ))}
        </div>

        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
                title="More Options"
              >
                <MoreVertical className="h-[22px] w-[22px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.location.href = '/login'} className="cursor-pointer gap-2">
                <LogIn className="h-4 w-4" />
                <span>{language === 'en' ? "Sign In" : "Ingia"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-2">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? t.darkMode : t.lightMode}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-1/2 min-w-[50vw] max-w-[50vw] border-l bg-background/95 p-0 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className="flex h-full flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="p-6 border-b">
                  <Link to="/" className="flex items-center gap-2">
                    <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-8 w-8" />
                    <span className="text-lg font-bold">Kibegi</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
                  {navLinks.map((link) => (
                    link.href.startsWith('#') ? (
                      <a
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    )
                  ))}

                  <div className="pt-4 border-t space-y-4">
                    {/* Dark Mode Toggle - Mobile */}
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors w-full text-left py-2"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="h-5 w-5 text-yellow-500" />
                          <span>{t.lightMode}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 text-blue-500" />
                          <span>{t.darkMode}</span>
                        </>
                      )}
                    </button>

                    {/* KOKOTOA Link - Mobile */}
                    <a
                      href="https://kokotoa.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      <Calculator className="h-5 w-5 text-accent" />
                      <span>KOKOTOA</span>
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
