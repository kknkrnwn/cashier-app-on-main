import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import { Plus, Edit3, Trash2, Tags, X, Check, FolderHeart } from 'lucide-react';
import toast from 'react-hot-toast';

export const Kategori: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useApp();

  // Dialog & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState('');

  // Calculate product counts per category
  const getProductCount = (categoryName: string) => {
    return products.filter(p => p.kategori === categoryName).length;
  };

  const handleCreateOpen = () => {
    setEditingId(null);
    setNama('');
    setIsModalOpen(true);
  };

  const handleEditOpen = (cat: Category) => {
    setEditingId(cat.id);
    setNama(cat.nama);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = nama.trim();
    if (!trimmedName) {
      toast.error('Nama kategori harus diisi.');
      return;
    }

    // Check duplicate category name
    const isDuplicate = categories.some(c => c.nama.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingId);
    if (isDuplicate) {
      toast.error('Kategori dengan nama tersebut sudah terdaftar.');
      return;
    }

    if (editingId) {
      updateCategory(editingId, trimmedName);
      toast.success('Kategori berhasil diperbarui');
    } else {
      addCategory({ nama: trimmedName });
      toast.success('Kategori berhasil ditambahkan');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const success = deleteCategory(id);
    if (success) {
      toast.success(`Kategori "${name}" berhasil dihapus.`);
    } else {
      toast.error(`Gagal menghapus kategori. Masih terdapat ${getProductCount(name)} produk yang aktif menggunakan kategori "${name}".`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page upper header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-zinc-400">Inventory Settings</p>
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-1">Kelola Kategori Produk</h2>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Tambah Kategori
        </button>
      </div>

      {/* Main categories listing layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => {
          const count = getProductCount(c.nama);
          
          return (
            <div 
              key={c.id}
              className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl dark:bg-zinc-800 dark:text-zinc-400">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {c.nama}
                  </h4>
                  <p className="text-xs font-semibold text-zinc-400 font-mono mt-0.5">
                    {count} varian produk aktif
                  </p>
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditOpen(c)}
                  className="p-2 text-zinc-500 hover:bg-gray-100 rounded-xl dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  title="Ubah Kategori"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.nama)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                  title="Hapus Kategori"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col items-center justify-center">
            <FolderHeart className="h-12 w-12 text-zinc-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Kategori Kosong</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Buat kategori produk baru terlebih dahulu agar dapat mengelompokkan inventaris produk Anda dengan rapi.
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal Popup (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            
            <div className="px-5 py-4.5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5.5 space-y-45">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makanan, Minuman, Sembako..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-zinc-600 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white rounded-xl shadow-md cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" /> Simpan Kategori
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
