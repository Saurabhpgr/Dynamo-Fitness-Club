// ============================================================================
// Admin Layout — Sidebar + Topbar + Content area
// ============================================================================
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  Dumbbell,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Members', path: '/admin/members', icon: <Users className="w-5 h-5" /> },
  { label: 'Add Member', path: '/admin/members/add', icon: <UserPlus className="w-5 h-5" /> },
  { label: 'Plans', path: '/admin/plans', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Receipts', path: '/admin/receipts', icon: <Receipt className="w-5 h-5" /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Enquiries', path: '/admin/enquiries', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  { label: 'Audit Log', path: '/admin/audit-log', icon: <FileText className="w-5 h-5" /> },
];

export function AdminLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/members?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gym-bg flex">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-30
          bg-gym-surface border-r border-gym-border
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gym-border flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-display font-bold text-text-primary truncate">
                DYNAMO FITNESS
              </h2>
              <p className="text-[10px] text-text-muted">Management System</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-accent-muted text-accent shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gym-surface-hover'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-status-expiring text-gym-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button */}
        <div className="border-t border-gym-border p-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-secondary hover:bg-gym-surface-hover transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72
          bg-gym-surface border-r border-gym-border
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gym-border">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-accent" />
            <span className="text-sm font-display font-bold text-text-primary">DYNAMO FITNESS</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-text-muted hover:text-text-primary"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gym-surface-hover'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gym-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-status-expired hover:bg-status-expired-bg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-sidebar-collapsed' : 'lg:ml-sidebar'}
        `}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-gym-surface/80 backdrop-blur-xl border-b border-gym-border h-16 flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-text-muted hover:text-text-primary"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by ID, name or phone..."
                className="w-full bg-gym-bg border border-gym-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>
          </form>

          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/admin/members/add')}
            >
              New Member
            </Button>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-text-muted hover:text-text-primary hover:bg-gym-surface-hover rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gym-border">
            <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-xs font-bold text-accent">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-text-muted">Owner</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-text-muted hover:text-status-expired hover:bg-status-expired-bg rounded-lg transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
