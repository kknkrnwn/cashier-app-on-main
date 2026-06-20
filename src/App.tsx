import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Kasir } from './pages/Kasir';
import { Produk } from './pages/Produk';
import { Kategori } from './pages/Kategori';
import { Transaksi } from './pages/Transaksi';
import { Laporan } from './pages/Laporan';
import { Pengaturan } from './pages/Pengaturan';

function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          {currentUser === 'admin' ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/kasir" element={<Kasir />} />
              <Route path="/produk" element={<Produk />} />
              <Route path="/kategori" element={<Kategori />} />
              <Route path="/transaksi" element={<Transaksi />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              {/* Cashier has access only to orders/billing page */}
              <Route path="/kasir" element={<Kasir />} />
              {/* Fallback to /kasir for any other routes */}
              <Route path="*" element={<Navigate to="/kasir" />} />
            </>
          )}
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark:bg-zinc-900 dark:text-white dark:border dark:border-zinc-800 text-xs font-bold font-sans rounded-xl shadow-xl',
          duration: 3550
        }}
      />
    </AppProvider>
  );
}
