import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  GitBranch, 
  Zap, 
  Target,
  Calculator,
  FileText,
  Mail,
  Info,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ai-hiradc', label: 'AI-HIRADC', icon: Shield },
    { path: '/fta', label: 'FTA', icon: GitBranch },
    { path: '/eta', label: 'ETA', icon: Zap },
    { path: '/cca', label: 'CCA', icon: Target },
    { path: '/calculator', label: 'Kalkulator K3', icon: Calculator },
    { path: '/reports', label: 'Laporan', icon: FileText },
    { path: '/kontak', label: 'Kontak', icon: Mail },
    { path: '/tentang-sistem', label: 'Tentang Sistem', icon: Info }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${active 
                    ? 'bg-[#0F172A] text-white dark:bg-[#F97316]' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;