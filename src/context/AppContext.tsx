import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Transaction, StoreSettings, Theme, CartItem } from '../types';
import { initialProducts, initialCategories, initialStoreSettings, getInitialTransactions } from '../data/mockData';

interface AppContextType {
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
  storeSettings: StoreSettings;
  theme: Theme;
  cart: CartItem[];
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  bulkImportProducts: (imported: Product[]) => void;
  
  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, nama: string) => void;
  deleteCategory: (id: string) => boolean;
  
  // Transaction Actions
  completeTransaction: (
    pelanggan: string,
    diskonNominal: number,
    pajakPersen: number,
    metodePembayaran: Transaction['metodePembayaran'],
    uangDibayar: number
  ) => Transaction | null;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Store actions
  updateStoreSettings: (settings: StoreSettings) => void;
  
  // Theme actions
  toggleTheme: () => void;

  // User Actions
  currentUser: 'admin' | 'kasir' | 'pelanggan' | null;
  login: (role: 'admin' | 'kasir' | 'pelanggan') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from Local Storage or fallback
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = localStorage.getItem('pos_products');
    const migrated = localStorage.getItem('pos_coffee_migrated_v6');
    if (!migrated) {
      localStorage.setItem('pos_products', JSON.stringify(initialProducts));
      return initialProducts;
    }
    return raw ? JSON.parse(raw) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = localStorage.getItem('pos_categories');
    const migrated = localStorage.getItem('pos_coffee_migrated_v6');
    if (!migrated) {
      localStorage.setItem('pos_categories', JSON.stringify(initialCategories));
      return initialCategories;
    }
    return raw ? JSON.parse(raw) : initialCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const raw = localStorage.getItem('pos_transactions');
    const migrated = localStorage.getItem('pos_coffee_migrated_v6');
    if (!migrated) {
      const initialTx = getInitialTransactions();
      localStorage.setItem('pos_transactions', JSON.stringify(initialTx));
      localStorage.setItem('pos_coffee_migrated_v6', 'true');
      return initialTx;
    }
    return raw ? JSON.parse(raw) : getInitialTransactions();
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const raw = localStorage.getItem('pos_store');
    return raw ? JSON.parse(raw) : initialStoreSettings;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const raw = localStorage.getItem('pos_theme');
    return (raw as Theme) || 'light';
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [currentUser, setCurrentUser] = useState<'admin' | 'kasir' | 'pelanggan' | null>(() => {
    return (localStorage.getItem('pos_current_user') as 'admin' | 'kasir' | 'pelanggan') || null;
  });

  // Push updates to localStorage when state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pos_current_user', currentUser);
    } else {
      localStorage.removeItem('pos_current_user');
    }
  }, [currentUser]);

  const login = (role: 'admin' | 'kasir' | 'pelanggan') => {
    setCurrentUser(role);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pos_store', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('pos_theme', theme);
    // Dark mode HTML binding
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // CATEGORIES CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      nama: cat.nama
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, nama: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, nama } : c));
    // Update categories on existing products
    const oldCat = categories.find(c => c.id === id)?.nama;
    if (oldCat && oldCat !== nama) {
      setProducts(prev => prev.map(p => p.kategori === oldCat ? { ...p, kategori: nama } : p));
    }
  };

  const deleteCategory = (id: string): boolean => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return false;
    
    // Check if any products exist in this category
    const hasProducts = products.some(p => p.kategori === catToDelete.nama);
    if (hasProducts) {
      return false; // Cannot delete category that contains products
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    return true;
  };

  // PRODUCTS CRUD
  const addProduct = (prod: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } as Product : p));
  };

  const deleteProduct = (id: string): boolean => {
    setProducts(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const bulkImportProducts = (imported: Product[]) => {
    // Merge or overwrite strategy: Overwrite by barcode / name if duplicates exist, else Append
    setProducts(prev => {
      const merged = [...prev];
      imported.forEach(newP => {
        const index = merged.findIndex(p => p.barcode === newP.barcode || p.nama.toLowerCase() === newP.nama.toLowerCase());
        if (index > -1) {
          // Update details, retain ID if matches, else take new
          merged[index] = { ...merged[index], ...newP, stok: merged[index].stok + newP.stok };
        } else {
          merged.unshift({
            ...newP,
            id: newP.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: newP.createdAt || new Date().toISOString()
          });
        }
      });
      return merged;
    });
  };

  // CART ACTIONS
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      if (existingIdx > -1) {
        const item = prev[existingIdx];
        const newQty = item.qty + quantity;
        const subtotal = item.harga * newQty;
        const updated = [...prev];
        updated[existingIdx] = { ...item, qty: newQty, subtotal };
        return updated;
      } else {
        return [...prev, {
          productId: product.id,
          nama: product.nama,
          harga: product.harga,
          qty: quantity,
          subtotal: product.harga * quantity
        }];
      }
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          qty,
          subtotal: item.harga * qty
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // STORE SETTINGS ACTIONS
  const updateStoreSettings = (settings: StoreSettings) => setStoreSettings(settings);

  // THEME ACTION
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // TRANSACTION ACTIONS
  const completeTransaction = (
    pelanggan: string,
    diskonNominal: number,
    pajakPersen: number,
    metodePembayaran: Transaction['metodePembayaran'],
    uangDibayar: number
  ): Transaction | null => {
    if (cart.length === 0) return null;

    // Calculate details
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxBase = subtotal - diskonNominal;
    const pajakNominal = Math.round(taxBase * (pajakPersen / 100));
    const total = taxBase + pajakNominal;

    // Validation
    if (metodePembayaran === 'Tunai' && uangDibayar < total) {
      throw new Error(`Uang dibayar (Rp${uangDibayar.toLocaleString()}) kurang dari total tagihan (Rp${total.toLocaleString()})!`);
    }

    const kembalian = metodePembayaran === 'Tunai' ? uangDibayar - total : 0;

    // Generate TRX number: TRX-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20260618
    const trxForToday = transactions.filter(t => t.id.startsWith(`TRX-${todayStr}`));
    const nextSeq = String(trxForToday.length + 1).padStart(4, '0');
    const newTrxId = `TRX-${todayStr}-${nextSeq}`;

    const newTransaction: Transaction = {
      id: newTrxId,
      tanggal: new Date().toISOString(),
      pelanggan: pelanggan.trim() || 'Umum (Walk-in)',
      subtotal,
      diskon: diskonNominal,
      pajak: pajakNominal,
      total,
      metodePembayaran,
      items: [...cart],
      uangDibayar: metodePembayaran === 'Tunai' ? uangDibayar : total,
      kembalian
    };

    // Deduct stock of products
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem) {
        return {
          ...p,
          stok: Math.max(0, p.stok - cartItem.qty)
        };
      }
      return p;
    }));

    // Save transaction
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Clear cart on success
    setCart([]);

    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    // Optionally restore stock? Restoring stock on transaction delete is a nice-to-have but let's keep it simple or restore stock. Let's restore stock for premium UX!
    const trx = transactions.find(t => t.id === id);
    if (trx) {
      setProducts(prev => prev.map(p => {
        const item = trx.items.find(i => i.productId === p.id);
        if (item) {
          return { ...p, stok: p.stok + item.qty };
        }
        return p;
      }));
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updated };
        const subtotal = merged.subtotal;
        const diskon = merged.diskon !== undefined ? merged.diskon : t.diskon;
        const pajak = merged.pajak !== undefined ? merged.pajak : t.pajak;
        const total = Math.max(0, subtotal - diskon + pajak);
        merged.total = total;
        
        if (merged.metodePembayaran === 'Tunai') {
          merged.uangDibayar = updated.uangDibayar !== undefined ? updated.uangDibayar : t.uangDibayar;
          merged.kembalian = Math.max(0, merged.uangDibayar - total);
        } else {
          merged.uangDibayar = total;
          merged.kembalian = 0;
        }
        return merged;
      }
      return t;
    }));
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      transactions,
      storeSettings,
      theme,
      cart,
      currentUser,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkImportProducts,
      addCategory,
      updateCategory,
      deleteCategory,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      updateStoreSettings,
      toggleTheme,
      completeTransaction,
      deleteTransaction,
      clearAllTransactions,
      updateTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
