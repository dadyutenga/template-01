import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageTitleConfig {
  [key: string]: {
    en: string;
    sw: string;
  };
}

const pageTitles: PageTitleConfig = {
  '/': {
    en: 'Kibegi - Your Digital School Bag',
    sw: 'Kibegi - Mfuko Wako wa Shule wa Dijitali'
  },
  '/login': {
    en: 'Login - Kibegi',
    sw: 'Ingia - Kibegi'
  },
  '/signup': {
    en: 'Sign Up - Kibegi',
    sw: 'Jisajili - Kibegi'
  },
  '/dashboard': {
    en: 'Dashboard - Kibegi',
    sw: 'Dashibodi - Kibegi'
  },
  '/upload': {
    en: 'Upload Files - Kibegi',
    sw: 'Pakia Faili - Kibegi'
  },
  '/classes': {
    en: 'My Classes - Kibegi',
    sw: 'Madarasa Yangu - Kibegi'
  },
  '/files': {
    en: 'My Files - Kibegi',
    sw: 'Faili Zangu - Kibegi'
  },
  '/friends': {
    en: 'Friends - Kibegi',
    sw: 'Marafiki - Kibegi'
  },
  '/profile': {
    en: 'Profile - Kibegi',
    sw: 'Wasifu - Kibegi'
  },
  '/trash': {
    en: 'Trash - Kibegi',
    sw: 'Takataka - Kibegi'
  },
  '/sharing': {
    en: 'Sharing - Kibegi',
    sw: 'Kushiriki - Kibegi'
  },
  '/notifications': {
    en: 'Notifications - Kibegi',
    sw: 'Arifa - Kibegi'
  },
  '/settings': {
    en: 'Settings - Kibegi',
    sw: 'Mipangilio - Kibegi'
  },
  '/storage': {
    en: 'Storage - Kibegi',
    sw: 'Hifadhi - Kibegi'
  },
  '/password-reset': {
    en: 'Reset Password - Kibegi',
    sw: 'Weka Upya Nywila - Kibegi'
  },
  '/password-reset/verify': {
    en: 'Verify Code - Kibegi',
    sw: 'Thibitisha Msimbo - Kibegi'
  },
  '/password-reset/confirm': {
    en: 'Set New Password - Kibegi',
    sw: 'Weka Nywila Mpya - Kibegi'
  }
};

export const usePageTitle = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Get page title based on current path
    const path = location.pathname;
    const titleConfig = pageTitles[path] || {
      en: 'Kibegi - Your Digital School Bag',
      sw: 'Kibegi - Mfuko Wako wa Shule wa Dijitali'
    };

    const title = titleConfig[language] || titleConfig.en;
    document.title = title;

    // Update favicon dynamically
    const updateFavicon = (iconPath: string) => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((link) => link.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = iconPath.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      link.href = iconPath;
      document.head.appendChild(link);

      // Also update shortcut icon
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = iconPath;
      document.head.appendChild(shortcutLink);
    };

    // Use SVG favicon (better quality)
    updateFavicon('/favicon/favicon.svg');

    // Cleanup function to restore default favicon if needed
    return () => {
      // Optionally restore default on unmount
    };
  }, [location.pathname, language]);
};

