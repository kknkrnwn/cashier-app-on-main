import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Store, Shield, User, HelpCircle, Check, Key, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login, storeSettings, theme, toggleTheme } = useApp();
  
  // Selection active state: 'admin' | 'kasir' | 'pelanggan'
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kasir' | 'pelanggan'>('pelanggan');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Handle standard PIN Verification
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin) {
      toast.error('Silakan masukkan PIN masuk!');
      return;
    }

    if (selectedRole === 'admin') {
      if (pin === '1234') {
        login('admin');
        toast.success('Penyelaras Admin Aktif! Selamat Datang.');
      } else {
        toast.error('PIN Administrator salah!');
      }
    } else if (selectedRole === 'kasir') {
      if (pin === '1111') {
        login('kasir');
        toast.success('Kanal Kasir Aktif! Selamat Bekerja.');
      } else {
        toast.error('PIN Kasir salah!');
      }
    } else if (selectedRole === 'pelanggan') {
      if (pin === '2222') {
        login('pelanggan');
        toast.success('Kanal Pelanggan Aktif! Silakan pilih pesanan.');
      } else {
        toast.error('PIN Pelanggan salah!');
      }
    }
  };

  const addPinNumber = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Banner Top Branding */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 p-8 text-center relative">
          <div className="absolute right-4 top-4">
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/10 hover:bg-white/20 transition-colors text-white rounded-xl text-xs font-semibold"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 p-1">
            {storeSettings.logo ? (
              <img 
                src={storeSettings.logo} 
                alt="Logo Toko" 
                className="h-full w-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="h-8 w-8 text-emerald-600" />
            )}
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {storeSettings.namaToko || 'CepatSaji Kasir'}
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 font-medium italic">
            Point of Sale Kasir Offline - Gerbang Masuk
          </p>
        </div>

        {/* Content Portal */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Tabs selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block text-center">
              Pilih Role Pengguna
            </span>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-zinc-950/60 p-1.5 rounded-2xl">
              
              {/* Option Pelanggan */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('pelanggan');
                  setPin('');
                }}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === 'pelanggan'
                    ? 'bg-white text-amber-600 dark:bg-zinc-800 dark:text-amber-400 shadow-md ring-1 ring-black/5'
                    : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400'
                }`}
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                <span className="text-[10px] sm:text-xs font-bold">Pelanggan</span>
              </button>

              {/* Option Kasir */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('kasir');
                  setPin('');
                }}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === 'kasir'
                    ? 'bg-white text-emerald-600 dark:bg-zinc-800 dark:text-emerald-400 shadow-md ring-1 ring-black/5'
                    : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400'
                }`}
              >
                <User className="h-4.5 w-4.5" />
                <span className="text-[10px] sm:text-xs font-bold">Kasir</span>
              </button>

              {/* Option Admin */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setPin('');
                }}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400 shadow-md ring-1 ring-black/5'
                    : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400'
                }`}
              >
                <Shield className="h-4.5 w-4.5" />
                <span className="text-[10px] sm:text-xs font-bold">Admin</span>
              </button>

            </div>
          </div>

          {/* Form and PIN Pad block */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-350 flex justify-between items-center">
                <span>Masukkan PIN Keamanan</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] hover:underline"
                >
                  {showPin ? <span className="flex items-center gap-1"><EyeOff className="h-3.5 w-3.5"/> Sembunyikan</span> : <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5"/> Lihat PIN</span>}
                </button>
              </label>

              {/* Input view */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  readOnly
                  placeholder="• • • •"
                  value={pin}
                  className="w-full bg-slate-50 border border-gray-300 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-center tracking-[0.5em] text-lg font-black font-mono outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Quick PIN Pad UI */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => addPinNumber(num)}
                  className="h-12 w-full bg-slate-50 border border-gray-200 hover:bg-slate-100 font-extrabold text-sm text-gray-800 rounded-xl active:scale-95 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 w-full bg-slate-100 hover:bg-slate-200 font-bold text-xs text-rose-600 rounded-xl active:scale-95 transition-all dark:bg-zinc-950 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => addPinNumber('0')}
                className="h-12 w-full bg-slate-50 border border-gray-200 hover:bg-slate-100 font-extrabold text-sm text-gray-800 rounded-xl active:scale-95 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 w-full bg-slate-100 hover:bg-slate-200 font-bold text-xs text-gray-600 rounded-xl active:scale-95 transition-all dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ⌫
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-[0.98] transition-transform mt-2"
            >
              Masuk Sistem
            </button>

          </form>

          {/* Credentials Info Notice */}
          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-[11px] leading-relaxed dark:bg-zinc-950/40 dark:border-zinc-800">
            <p className="font-bold text-gray-900 dark:text-zinc-300 flex items-center gap-1.5 shrink-0">
              <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              Petunjuk PIN Pengguna POS :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-500 dark:text-zinc-400 font-medium">
              <li>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Pelanggan:</span> PIN <code className="font-mono bg-amber-50 dark:bg-amber-950/20 px-1 py-0.5 rounded font-bold">2222</code> (Hanya pilih pesanan & kirim pesanan)
              </li>
              <li>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Kasir:</span> PIN <code className="font-mono bg-indigo-50 dark:bg-indigo-950/20 px-1 py-0.5 rounded font-bold">1111</code> (Akses menu kasir penjualan)
              </li>
              <li>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Admin:</span> PIN <code className="font-mono bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded font-bold">1234</code> (Akses penuh seluruh operasional)
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
