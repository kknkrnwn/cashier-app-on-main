import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Image as ImageIcon,
  Check, 
  AlertTriangle,
  Upload, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Barcode,
  X,
  FolderHeart
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Produk: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, bulkImportProducts, addCategory, deleteCategory } = useApp();

  // Custom modal trigger state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);

  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Search, Filter, Pagination States
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [harga, setHarga] = useState(0);
  const [stok, setStok] = useState(10);
  const [barcode, setBarcode] = useState('');
  const [gambar, setGambar] = useState('');

  // Sorter State
  const [sortBy, setSortBy] = useState<'nama' | 'harga' | 'stok' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CSV/Excel upload ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter Categories dropdown
  const categoryNames = useMemo(() => {
    return ['Semua', ...categories.map(c => c.nama)];
  }, [categories]);

  // Image base64 handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // ~500kb limit safety for localStorage
        toast.error('Berkas gambar terlalu besar (Maksimal 500KB untuk database lokal)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGambar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Form for creation
  const handleCreateOpen = () => {
    setEditingId(null);
    setNama('');
    setKategori(categories[0]?.nama || '');
    setHarga(0);
    setStok(10);
    setBarcode('');
    setGambar('');
    setIsFormOpen(true);
  };

  // Open Form for editing
  const handleEditOpen = (p: Product) => {
    setEditingId(p.id);
    setNama(p.nama);
    setKategori(p.kategori);
    setHarga(p.harga);
    setStok(p.stok);
    setBarcode(p.barcode);
    setGambar(p.gambar || '');
    setIsFormOpen(true);
  };

  // Form Submition (Create / Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      toast.error('Nama produk wajib diisi.');
      return;
    }
    if (!kategori) {
      toast.error('Harap pilih kategori valid atau buat kategori baru terlebih dahulu.');
      return;
    }
    if (harga < 0) {
      toast.error('Harga tidak boleh bernilai negatif.');
      return;
    }
    if (stok < 0) {
      toast.error('Stok tidak boleh bernilai negatif.');
      return;
    }

    const cleanBarcode = barcode.trim() || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const payload = {
      nama: nama.trim(),
      kategori,
      harga,
      stok,
      barcode: cleanBarcode,
      gambar: gambar || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60' // Default placeholder
    };

    if (editingId) {
      updateProduct(editingId, payload);
      toast.success('Produk berhasil diperbarui');
    } else {
      addProduct(payload);
      toast.success('Produk berhasil ditambahkan');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  // PARSER Excel (.xlsx, .csv)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawJson.length === 0) {
          toast.error('Berkas Excel/CSV kosong!');
          return;
        }

        // Map raw cells to Products
        const mapped: Product[] = [];
        rawJson.forEach((row, i) => {
          // Flexible mapping headers
          const namaProd = row.Nama || row.nama || row.NamaProduk || row.product_name || row.Name;
          const katProd = row.Kategori || row.kategori || row.category || 'Makanan';
          const hrgProd = Number(row.Harga || row.harga || row.price || 0);
          const stkProd = Number(row.Stok || row.stok || row.stok_awal || row.stock || row.quantity || 0);
          const barProd = String(row.Barcode || row.barcode || row.sku || row.code || '').trim() || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`;

          if (namaProd) {
            mapped.push({
              id: `prod-imported-${Date.now()}-${i}`,
              nama: String(namaProd),
              kategori: String(katProd),
              harga: hrgProd,
              stok: stkProd,
              barcode: barProd,
              gambar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60',
              createdAt: new Date().toISOString()
            });
          }
        });

        if (mapped.length > 0) {
          bulkImportProducts(mapped);
          toast.success(`Berhasil mengimpor ${mapped.length} produk ke dalam sistem!`);
        } else {
          toast.error('Format kolom Excel tidak cocok. Harap sediakan header: "Nama", "Kategori", "Harga", "Stok", "Barcode".');
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memproses berkas Excel. Periksa kembali struktur tabel Anda.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download Excel Template for users to write and upload
  const downloadTemplate = () => {
    const templateRows = [
      { Nama: 'Roti Bakar Bandung', Kategori: 'Makanan', Harga: 15000, Stok: 20, Barcode: '8999128374612' },
      { Nama: 'Jus Alpukat', Kategori: 'Minuman', Harga: 12000, Stok: 15, Barcode: '8999128374629' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_POS');
    XLSX.writeFile(workbook, 'template_impor_produk.xlsx');
    toast.success('Template berhasil diunduh!');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || 
                              p.barcode.includes(search) || 
                              p.kategori.toLowerCase().includes(search.toLowerCase());
        const matchesKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
        return matchesSearch && matchesKategori;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        
        // treats numbers
        const numA = valA as number;
        const numB = valB as number;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      });
  }, [products, search, selectedKategori, sortBy, sortOrder]);

  // PAGINATION
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-zinc-400">Inventory Management</p>
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-1">Daftar Produk Toko</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template download link */}
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-zinc-600 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition-all"
            title="Download Excel Template"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Unduh Template Excel
          </button>

          {/* Import xlsx button wrapper */}
          <label className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-zinc-600 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition-all">
            <Upload className="h-4 w-4 text-emerald-500" />
            Impor CSV / Excel
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
          </label>

          {/* Kelola Kategori button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-zinc-700 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition-all active:scale-95"
            title="Kelola Kategori"
          >
            <FolderHeart className="h-4 w-4 text-emerald-500" />
            Kelola Kategori
          </button>

          <button
            onClick={handleCreateOpen}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Control panel (Filters + Search) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-center gap-3.5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama, kategori, atau barcode..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500 max-w-full transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-56 shrink-0 relative">
          <select
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 focus:border-emerald-500 cursor-pointer pl-10"
          >
            {categoryNames.map(name => (
              <option className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100 font-semibold" key={name} value={name}>{name}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </div>

        {/* Sorters */}
        <div className="w-full md:w-max flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-zinc-300 cursor-pointer"
          >
            <option className="bg-white text-gray-950 dark:bg-zinc-900 dark:text-white" value="nama">Urutkan: Nama</option>
            <option className="bg-white text-gray-955 dark:bg-zinc-900 dark:text-white" value="harga">Urutkan: Harga</option>
            <option className="bg-white text-gray-955 dark:bg-zinc-900 dark:text-white" value="stok">Urutkan: Stok</option>
            <option className="bg-white text-gray-955 dark:bg-zinc-900 dark:text-white" value="createdAt">Urutkan: Tanggal dibuat</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
          >
            {sortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
          </button>
        </div>

      </div>

      {/* Grid List Products */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedProducts.map((p) => {
            const isLowStock = p.stok <= 5;
            return (
              <div 
                key={p.id}
                className="group relative bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800"
              >
                {/* Image & Quick Action block */}
                <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-3 border border-gray-100 dark:bg-zinc-950 dark:border-zinc-800">
                  <img
                    src={p.gambar}
                    alt={p.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60';
                    }}
                  />
                  {/* Category Pill Tag */}
                  <span className="absolute left-2.5 top-2.5 text-[9px] font-bold text-gray-700 bg-white/94 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-sm dark:bg-zinc-900 dark:text-zinc-200">
                    {p.kategori}
                  </span>
                  
                  {isLowStock && (
                    <span className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[9px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-sm">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Stok Menipis
                    </span>
                  )}
                </div>

                {/* Primary Meta info */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between min-w-0 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-950 dark:text-white truncate group-hover:text-emerald-600 transition-colors" title={p.nama}>
                      {p.nama}
                    </h3>
                    <p className="text-[10px] text-zinc-455 font-semibold text-zinc-400 font-mono flex items-center gap-1">
                      <Barcode className="h-3 w-3 shrink-0 text-zinc-500" />
                      {p.barcode}
                    </p>
                  </div>
                  
                  {/* Prices & Stocks */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-55 dark:border-zinc-800">
                    <div>
                      <p className="text-[9px] text-zinc-400 font-medium">HARGA</p>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        Rp{p.harga.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-400 font-medium">SISA STOK</p>
                      <p className={`text-xs font-bold font-mono ${isLowStock ? 'text-rose-600 animate-pulse' : 'text-gray-800 dark:text-zinc-300'}`}>
                        {p.stok} unit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons card overlay/footer */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleEditOpen(p)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-gray-650 dark:text-zinc-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.nama)}
                    className="p-2 border border-rose-100 dark:border-rose-950/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-xl active:scale-95 transition-all cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-zinc-450 flex flex-col items-center justify-center dark:bg-zinc-900 dark:border-zinc-800">
          <ImageIcon className="h-12 w-12 text-zinc-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tidak Ada Produk Ditemukan</h3>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-sm">
            Cobalah mengubah filter kata kunci kata pencarian Anda, atau tambahkan produk baru secara manual.
          </p>
          <button
            onClick={handleCreateOpen}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer transition-all"
          >
            Buat Produk Baru
          </button>
        </div>
      )}

      {/* Pagination control row */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
            Menampilkan {paginatedProducts.length} dari {filteredProducts.length} produk
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 rounded-lg text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                    : 'border border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-805'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 rounded-lg text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Form Container Drawer (Add or Edit Product) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Modal Heading Header */}
            <div className="px-5 py-4.5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  {editingId ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1 leading-none">Masukkan detail produk inventaris kasir toko Anda</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSubmit} className="p-5.5 space-y-4">
              
              {/* Row 1: Nama */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Kopi Susu Aren, Beras 5kg, dll."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* Row 2: Category & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Kategori *</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.nama} className="bg-white dark:bg-zinc-800">{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="Kosongkan untuk otomatisasi"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Harga & Stok */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Harga Jual (idr Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={harga}
                    onChange={(e) => setHarga(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Sedia Stok *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stok}
                    onChange={(e) => setStok(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Image Upload */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Foto / Gambar Produk</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl border border-gray-250 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 dark:border-zinc-800 dark:bg-zinc-950">
                    {gambar ? (
                      <img src={gambar} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-zinc-350" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      id="image-uploader-el"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label 
                      htmlFor="image-uploader-el"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-650 rounded-lg dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Pilih Gambar
                    </label>
                    <p className="text-[10px] text-zinc-400">Direkomendasikan foto produk JPG/PNG persegi, maks 500KB.</p>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-zinc-650 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            toast.success('Produk berhasil dihapus');
            setDeleteTarget(null);
          }
        }}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.name}"? Stok produk ini juga akan terhapus darı sistem.`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmStyle="rose"
        isWarning={true}
      />

      {/* MANAGE CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-120">
            
            <div className="px-5 py-4 bg-slate-50 border-b border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-955 dark:text-white flex items-center gap-2">
                <FolderHeart className="h-4.5 w-4.5 text-emerald-500" />
                Kelola Kategori Produk
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                }}
                className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg text-gray-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Form to add category */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newCategoryName.trim();
                  if (!trimmed) {
                    toast.error('Nama kategori tidak boleh kosong.');
                    return;
                  }
                  
                  // Duplicate check
                  const exist = categories.some(c => c.nama.toLowerCase() === trimmed.toLowerCase());
                  if (exist) {
                    toast.error('Kategori dengan nama ini sudah ada.');
                    return;
                  }

                  addCategory({ nama: trimmed });
                  toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
                  setNewCategoryName('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik nama kategori baru..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </button>
              </form>

              {/* List of current categories */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Daftar Kategori Saat Ini</label>
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl bg-slate-50/30">
                  {categories.map((cat) => {
                    // count products in this category
                    const prodCount = products.filter(p => p.kategori === cat.nama).length;
                    return (
                      <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{cat.nama}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{prodCount} Produk terkait</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const success = deleteCategory(cat.id);
                            if (success) {
                              toast.success(`Kategori "${cat.nama}" berhasil dihapus.`);
                            } else {
                              toast.error(`Tidak dapat menghapus! Kategori "${cat.nama}" sedang digunakan oleh ${prodCount} produk.`);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg text-gray-400 cursor-pointer transition-all"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      Belum ada kategori. Silakan buat satu di atas!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-805 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 dark:bg-zinc-800 rounded-xl font-bold dark:text-white cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
