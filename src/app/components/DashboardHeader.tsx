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

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.path ? (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Languages className="w-4 h-4" style={{ color: '#8A1538' }} />
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {(!breadcrumbs || breadcrumbs.length === 0) && !hideLanguageToggle && (
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Languages className="w-4 h-4" style={{ color: '#8A1538' }} />
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}