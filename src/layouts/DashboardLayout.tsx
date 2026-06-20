import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Store,
  Clock,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, storeSettings, currentUser, logout } = useApp();
  const location = useLocation();
  const isKasirPage = location.pathname === '/kasir';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [time, setTime] = useState(new Date());

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawMenuItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Kasir', path: '/kasir', icon: ShoppingCart },
    { title: 'Produk', path: '/produk', icon: Package },
    { title: 'Kategori', path: '/kategori', icon: Tags },
    { title: 'Transaksi', path: '/transaksi', icon: History },
    { title: 'Laporan', path: '/laporan', icon: BarChart3 },
    { title: 'Pengaturan', path: '/pengaturan', icon: Settings },
  ];

  const menuItems = currentUser === 'admin'
    ? rawMenuItems
    : rawMenuItems.filter(item => item.path === '/kasir');

  const getActiveTitle = () => {
    const active = menuItems.find(item => item.path === location.pathname);
    return active ? active.title : 'POS Kasir';
  };

  const getLocalDateTime = () => {
    return time.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + '  |  ' + time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Close mobile menu on navigate
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans flex text-slate-800 dark:text-zinc-200 transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      {!isKasirPage && (
        <aside 
          className={`hidden md:flex flex-col border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-350 shrink-0 relative ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
        {/* Toggle Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 z-20 h-6 w-6 rounded-full border border-gray-200 bg-white text-zinc-600 shadow-md hover:bg-slate-50 flex items-center justify-center dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
 
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3.5 px-5 border-b border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            {storeSettings.logo ? (
              <img 
                src={storeSettings.logo} 
                alt="Logo" 
                className="h-10 w-10 rounded-xl object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="h-5.5 w-5.5" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                {storeSettings.namaToko || 'CepatSaji Kasir'}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                APP POS KASIR
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                id={`nav-${item.title.toLowerCase()}`}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-slate-100/65 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500Group-hover:text-zinc-800'}`} />
                {!isCollapsed && <span>{item.title}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-18 scale-0 origin-left group-hover:scale-100 bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-lg shrink-0 pointer-events-none whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Active User */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
          
          {/* Active User Badge */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-gray-100/70 dark:border-zinc-800">
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${currentUser === 'admin' ? 'bg-indigo-600' : currentUser === 'kasir' ? 'bg-emerald-600' : 'bg-amber-600 dark:bg-amber-600'}`}>
                {currentUser === 'admin' ? 'AD' : currentUser === 'kasir' ? 'KS' : 'PL'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                  {currentUser === 'admin' ? 'Administrator' : currentUser === 'kasir' ? 'Kasir Utama' : 'Pelanggan (Customer)'}
                </span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
                  {currentUser}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl dark:bg-rose-950/15 dark:border-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-all cursor-pointer text-xs font-bold"
            >
              <LogOut className="h-3.5 w-3.5" />
              {!isCollapsed && <span>Keluar</span>}
            </button>
          </div>

        </div>
      </aside>
      )}

      {/* Mobile Menu Drawer */}
      {!isKasirPage && isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setIsMobileOpen(false)}
          ></div>
          
          {/* Drawer container */}
          <div className="relative w-64 max-w-[85vw] h-full bg-white dark:bg-zinc-900 flex flex-col border-r border-gray-100 dark:border-zinc-800 z-50">
            <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                  {storeSettings.namaToko || 'Kasir Modern'}
                </span>
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-zinc-450 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-450'
                        : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-zinc-650" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer & active user */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-805 space-y-2">
              
              <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-gray-100/70 dark:border-zinc-800">
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${currentUser === 'admin' ? 'bg-indigo-600' : currentUser === 'kasir' ? 'bg-emerald-600' : 'bg-amber-600 dark:bg-amber-600'}`}>
                  {currentUser === 'admin' ? 'AD' : currentUser === 'kasir' ? 'KS' : 'PL'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                    {currentUser === 'admin' ? 'Administrator' : currentUser === 'kasir' ? 'Kasir Utama' : 'Pelanggan (Customer)'}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
                    {currentUser}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl dark:bg-rose-950/15 dark:border-rose-950/20 dark:text-rose-400 font-bold text-xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-5 md:px-8 flex items-center justify-between gap-4 z-10 shrink-0">
          
          {/* Mobile hamburger menu */}
          {!isKasirPage && (
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 text-zinc-600 dark:text-zinc-300 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Page Title & Breadcrumb */}
          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
              {getActiveTitle()}
            </h1>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600 dark:bg-emerald-400"></span>
              </span>
              Mode Lokal Aktif
            </div>

            {currentUser === 'admin' && isKasirPage && (
              <Link 
                to="/"
                className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Kembali ke Dashboard Admin</span>
                <span className="sm:hidden inline">Admin</span>
              </Link>
            )}
          </div>

          {/* Clock & Store Settings details */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/70 border border-slate-200/50 text-xs font-semibold text-slate-500 select-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0 animate-pulse" />
              <span className="font-mono tracking-tight">{getLocalDateTime()}</span>
            </div>

            {/* Tombol Mode di sebelah Jam */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-xl text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer h-8.5 w-8.5 flex items-center justify-center shadow-xs"
              title={theme === 'light' ? "Ubah ke Mode Gelap" : "Ubah ke Mode Terang"}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-indigo-500" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>
            
            {/* Store Name Badge */}
            <div className="flex items-center gap-2">
              <div className="h-8.5 w-8.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 flex items-center justify-center p-1 font-bold text-zinc-600 dark:text-zinc-300 text-xs object-cover capitalize shrink-0 select-none shadow-sm">
                {storeSettings.namaToko ? storeSettings.namaToko[0] : 'S'}
              </div>
            </div>

            {isKasirPage && (
              <>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl dark:bg-rose-950/15 dark:border-rose-950/20 dark:text-rose-450 transition-all font-bold text-xs cursor-pointer h-8.5 select-none"
                  title="Keluar"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Route View Stage with animation */}
        <main className={`flex-1 overflow-y-auto ${isKasirPage ? 'p-3 sm:p-5 md:p-8' : 'p-5 md:p-8'}`}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.23, ease: 'easeOut' }}
            className="max-w-7xl mx-auto w-full h-full"
          >
            {children}
          </motion.div>
        </main>

      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          setIsMobileOpen(false);
        }}
        title="Keluar Sistem Kasir"
        message="Apakah Anda yakin ingin keluar dari akun kasir POS ini?"
        confirmText="Keluar"
        cancelText="Batal"
        confirmStyle="rose"
      />
    </div>
  );
};
