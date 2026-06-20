import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Store, Phone, MapPin, Upload, Check, HelpCircle, RefreshCw, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export const Pengaturan: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form states initialized from Context
  const [namaToko, setNamaToko] = useState(storeSettings.namaToko);
  const [alamat, setAlamat] = useState(storeSettings.alamat);
  const [telepon, setTelepon] = useState(storeSettings.telepon);
  const [logo, setLogo] = useState(storeSettings.logo);
  const [nmid, setNmid] = useState(storeSettings.nmid || 'ID1026514400302');
  const [merchantId, setMerchantId] = useState(storeSettings.merchantId || '93600915');
  const [kota, setKota] = useState(storeSettings.kota || 'Kab. Tangerang');
  const [kodePos, setKodePos] = useState(storeSettings.kodePos || '15810');
  const [rawQrisPayload, setRawQrisPayload] = useState(storeSettings.rawQrisPayload || '');

  // Logo base64 converter
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300000) { // ~300kb limit for settings logo to fit localstorage budget easily
        toast.error('Berkas Gambar Logo terlalu besar (Maksimal 300KB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaToko.trim()) {
      toast.error('Nama toko tidak boleh kosong.');
      return;
    }

    updateStoreSettings({
      namaToko: namaToko.trim(),
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      logo,
      nmid: nmid.trim(),
      merchantId: merchantId.trim(),
      kota: kota.trim(),
      kodePos: kodePos.trim(),
      rawQrisPayload: rawQrisPayload.trim()
    });

    toast.success('Konfigurasi identitas toko sukses diperbarui!');
  };

  const handleResetDefault = () => {
    setShowResetConfirm(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Upper header section */}
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-zinc-400">Merchant Settings</p>
        <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-1">Pengaturan Toko</h2>
      </div>

      {/* Settings Grid form block */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
        
        {/* Decorative branding info */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-700 h-2 bg-cover"></div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          
          {/* Logo Brand Upload Row */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">Logo / Simbol Toko</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              
              <div className="h-20 w-20 rounded-2xl border border-gray-250 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
                {logo ? (
                  <img src={logo} alt="Logo Toko" className="h-full w-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  <Store className="h-6 w-6 text-zinc-350" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  id="logo-settings-uploader"
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="logo-settings-uploader"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-200 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <Upload className="h-4 w-4 text-emerald-500" />
                  Unggah Logo Baru
                </label>
                <p className="text-[10px] text-zinc-400 leading-normal max-w-sm">
                  Logo akan tercetak pada halaman ringkasan kasir, laporan eksekutif bulanan instan, serta struk nota. Format pas persegi JPG, PNG, GIF maks 300KB.
                </p>
              </div>

            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-zinc-800 pt-5 space-y-4">
            
            {/* Toko Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-zinc-400" /> Nama Toko / UMKM *
              </label>
              <input
                type="text"
                required
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                placeholder="e.g. CepatSaji Kasir, Minimarket Berkah..."
                className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* NMID QRIS */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-zinc-400" /> NMID Merchant (QRIS)
              </label>
              <input
                type="text"
                value={nmid}
                onChange={(e) => setNmid(e.target.value)}
                placeholder="e.g. ID1026514400302"
                className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[10px] text-zinc-400 leading-normal">
                Kode QRIS National Merchant ID (NMID) resmi toko Anda, yang akan dicetak di visual QR pembayaran.
              </p>
            </div>

            {/* Merchant ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-zinc-400" /> Merchant ID (MID)
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="e.g. 93600915"
                className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[10px] text-zinc-400 leading-normal">
                Kode internal merchant ID (biasanya dicetak di struk / di bawah barcode). Default: 93600915.
              </p>
            </div>

            {/* Kota & Kode Pos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Kabupaten / Kota QRIS
                </label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  placeholder="e.g. KAB. TANGERANG"
                  className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Kode Pos Merchant
                </label>
                <input
                  type="text"
                  value={kodePos}
                  onChange={(e) => setKodePos(e.target.value)}
                  placeholder="e.g. 15810"
                  className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Raw Payload QRIS Override */}
            <div className="space-y-1 bg-[#d1191e]/5 p-3 rounded-xl border border-[#d1191e]/10">
              <label className="text-xs font-bold text-[#d1191e] flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" /> Override Raw QRIS Payload (Opsional)
              </label>
              <textarea
                value={rawQrisPayload}
                onChange={(e) => setRawQrisPayload(e.target.value)}
                placeholder="00020101021126630014ID.CO.QRIS.WWW0115..."
                rows={2}
                className="w-full border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white rounded-xl px-3 py-2 text-[10px] outline-none focus:border-[#d1191e] font-mono break-all"
              />
              <p className="text-[10px] text-zinc-500 leading-normal">
                Penting: Biarkan kosong untuk menggunakan data generate otomatis sesuai foto. Jika Anda memiliki kode QRIS statis dari GoPay/ShopeePay/dana dll, paste string panjangnya di sini untuk memunculkan barcode asli Anda!
              </p>
            </div>

            {/* Telephone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> No. Telepon / Kontak Toko
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="e.g. 021-382716, 0812-XXXX-XXXX"
                className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Alamat Fisik Lengkap Toko
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="e.g. Jl. Anggrek No. 15, Bandung"
                rows={3}
                className="w-full border border-gray-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-emerald-500 resize-none"
              />
            </div>

          </div>

          {/* Form Action Controls */}
          <div className="border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            
            <button
              type="button"
              onClick={handleResetDefault}
              className="w-full sm:w-auto flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Setel Ulang ke Sediaan Awal
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 transition-transform"
            >
              <Check className="h-4.5 w-4.5" />
              Simpan Perubahan Pengaturan
            </button>

          </div>

        </form>

      </div>

      {/* Info Notice Box */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4.5 flex gap-3 text-xs text-slate-650 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-400 shadow-sm leading-relaxed items-start">
        <HelpCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-gray-900 dark:text-white">Mengapa data disimpan di Local Storage?</span>
          <p className="mt-1">
            Sistem Point of Sale ini beroperasi 100% secara offline mandiri pada browser Google AI Studio Anda tanpa memerlukan infrastruktur server terpisah. Data aman disimpan di media penyimpanan lokal privat Anda dan tidak pernah keluar dari komputer Anda.
          </p>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setNamaToko('IT TECH SOLUTION');
          setAlamat('Jl. Boulevard Raya Blok H4 No. 12, Jakarta');
          setTelepon('021-82736452');
          setLogo('https://images.unsplash.com/photo-1473187983305-f615310e7daa?w=100&auto=format&fit=crop&q=60');
          setNmid('ID1026514400302');
          setMerchantId('93600915');
          setKota('Kab. Tangerang');
          setKodePos('15810');
          setRawQrisPayload('');
          toast.success('Disetel ke default. Klik simpan untuk menerapkan.');
          setShowResetConfirm(false);
        }}
        title="Reset Identitas Toko?"
        message="Apakah Anda yakin ingin menyetel ulang identitas toko ke profil default bawaan? Perubahan baru akan benar-benar tersimpan setelah Anda menekan tombol simpan."
        confirmText="Reset"
        cancelText="Batal"
        confirmStyle="indigo"
      />

    </div>
  );
};
