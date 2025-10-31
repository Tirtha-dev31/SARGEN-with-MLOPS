import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Bot, PenTool, Users, CheckCircle, Shield, LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  userInfo?: {
    name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}

export default function Layout({ children, userInfo, onLogout }: LayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Case Inbox', badge: 12 },
    { path: '/overview', icon: FileText, label: 'Overview', badge: null },
    { path: '/analytics', icon: BarChart3, label: 'Analysis & Insights', badge: null },
    { path: '/ai-chat', icon: Bot, label: 'AI Copilot', badge: null },
    { path: '/drafting', icon: PenTool, label: 'Drafting Studio', badge: null },
    { path: '/collaborate', icon: Users, label: 'Collaborate', badge: null },
    { path: '/validate', icon: CheckCircle, label: 'Validate & Submit', badge: null },
  ];
  
  return (
    <div className="flex min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-72 bg-dark-card border-r border-dark-border p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SMART SAR</h1>
            <p className="text-sm text-gray-400">AI-Driven Management</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === 'number' ? (
                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                ) : item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {userInfo && (
          <div className="mt-auto pt-6 border-t border-dark-border">
            <div className="bg-dark-bg rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{userInfo.name}</div>
                  <div className="text-xs text-gray-400 truncate">{userInfo.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </aside>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
