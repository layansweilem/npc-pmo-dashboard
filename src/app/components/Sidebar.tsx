import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardCheck, 
  FileText,
  Activity
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const navigation = [
  { name: 'Executive Overview', path: '/', icon: LayoutDashboard, key: 'nav.executive' },
  { name: 'Portfolio Deep Dive', path: '/portfolio', icon: FolderKanban, key: 'nav.portfolio' },
  { name: 'Project Manager View', path: '/project-manager', icon: ClipboardCheck, key: 'nav.project' },
  { name: 'Project Details', path: '/project-details', icon: FileText, key: 'nav.details' },
];

export function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <div className="w-64 bg-[#8A1538] text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-white" />
          <div>
            <h1 className="font-semibold text-lg">PMO Dashboard</h1>
            <p className="text-xs text-white/70">Enterprise Portfolio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#A29475] text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/70">
          <p>35 Active Projects</p>
          <p className="mt-1">Q1 2026 Portfolio</p>
        </div>
      </div>
    </div>
  );
}