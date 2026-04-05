import { ChevronRight, Languages } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  hideLanguageToggle?: boolean;
}

export function DashboardHeader({ title, subtitle, breadcrumbs, hideLanguageToggle }: DashboardHeaderProps) {
  const { language, toggleLanguage } = useLanguage();

  const now = new Date();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-gradient-to-r from-[#8A1538] via-[#a91d47] to-[#8A1538] px-8 py-5 shadow-lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.path ? (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Languages className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-white/70 mt-0.5 text-sm">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white/60 text-[11px] uppercase tracking-wider font-medium">{language === 'ar' ? 'آخر تحديث' : 'Last Updated'}</p>
            <p className="text-white/90 text-sm font-medium">{dateStr}</p>
            <p className="text-white/60 text-xs">{timeStr}</p>
          </div>
          {(!breadcrumbs || breadcrumbs.length === 0) && !hideLanguageToggle && (
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <Languages className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white/90">
                {language === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}