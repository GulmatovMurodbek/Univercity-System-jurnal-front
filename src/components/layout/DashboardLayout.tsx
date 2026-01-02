import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  UserCircle,
  Building2,
  MessageSquare,
  LockKeyhole,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Панели идора', path: '/admin' },
  { icon: Users, label: 'Гурӯҳҳо', path: '/admin/groups' },
  { icon: GraduationCap, label: 'Донишҷӯён', path: '/admin/students' },
  { icon: UserCircle, label: 'Муаллимон', path: '/admin/teachers' },
  { icon: BookOpen, label: 'Фанҳо', path: '/admin/subjects' },
  { icon: CalendarDays, label: 'Ҳозиршавии ҳафтаина', path: '/admin/attendance/weekly' },
  { icon: CalendarDays, label: 'Баҳоҳои ҳафтаина', path: '/admin/grades/weekly' },
  { icon: MessageSquare, label: 'Эзоҳҳо', path: '/admin/noutes' },
  { icon: Calendar, label: 'Ҷадвали ҳафтаина', path: '/admin/schedule' },
  { icon: Settings, label: 'Танзимот', path: '/admin/settings' },
];

const teacherNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Панел', path: '/teacher' },
  { icon: BookOpen, label: 'Фанҳро дидан', path: '/teacher/subjects' },
  { icon: Users, label: 'Гурӯҳҳоро дидан', path: '/teacher/groups' },
  { icon: Calendar, label: 'Ҷадвали ҳафтаина', path: '/teacher/schedule' },
  { icon: LockKeyhole, label: 'Иввази парол', path: '/teacher/profile' },
];

const studentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Панел', path: '/student' },
  { icon: ClipboardList, label: 'Ҳозиршавии ман', path: '/student/attendance' },
  { icon: FileSpreadsheet, label: 'Баҳогузории ман', path: '/student/grades' },
  { icon: Calendar, label: 'Ҷадвали ҳафтаина', path: '/student/schedule' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems =
    user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'teacher'
      ? teacherNavItems
      : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    if (path === `/${user?.role}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border/50 transition-all duration-300 shadow-card',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ITRZS-system jurnal</span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-muted-foreground"
          >
            
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform',
                !isSidebarOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActivePath(item.path)
                      ? 'gradient-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border/50">
         
          <Button
            variant="ghost"
            size={isSidebarOpen ? 'default' : 'icon'}
            onClick={handleLogout}
            className={cn(
              'mt-3 text-muted-foreground hover:text-destructive',
              isSidebarOpen ? 'w-full justify-start' : 'w-full'
            )}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="ml-2">Баромадан</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">ITRZS-system jurnal</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border-b border-border/50 shadow-lg"
            >
              <nav className="py-2 px-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                          isActivePath(item.path)
                            ? 'gradient-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Баромадан
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-hidden">
        <div className="h-full lg:overflow-y-auto pt-16 lg:pt-0">
          <div className="p-4 lg:p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
