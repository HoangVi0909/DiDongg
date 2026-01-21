import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config/network';

export interface AdminProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  image?: string;
  stock: number;
}

interface AdminProductManagerType {
  products: AdminProduct[];
  loading: boolean;
  addProduct: (product: AdminProduct) => Promise<boolean>;
  updateProduct: (product: AdminProduct) => Promise<boolean>;
  deleteProduct: (productId: number) => Promise<boolean>;
  fetchProducts: () => Promise<void>;
}

const AdminProductContext = createContext<AdminProductManagerType | undefined>(undefined);

export function AdminProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getApiUrl()}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: AdminProduct): Promise<boolean> => {
    try {
      setLoading(true);
      // Gọi API tạo sản phẩm
      // const res = await fetch(`${getApiUrl()}/products`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product),
      // });
      
      // Mock
      const newProduct = { ...product, id: Date.now() };
      setProducts([...products, newProduct]);
      console.log('✅ Product added:', newProduct);
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (product: AdminProduct): Promise<boolean> => {
    try {
      setLoading(true);
      // Gọi API cập nhật sản phẩm
      // const res = await fetch(`${getApiUrl()}/products/${product.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product),
      // });

      // Mock
      setProducts(products.map(p => p.id === product.id ? product : p));
      console.log('✅ Product updated:', product);
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number): Promise<boolean> => {
    try {
      setLoading(true);
      // Gọi API xóa sản phẩm
      // const res = await fetch(`${getApiUrl()}/products/${productId}`, {
      //   method: 'DELETE',
      // });

      // Mock
      setProducts(products.filter(p => p.id !== productId));
      console.log('✅ Product deleted:', productId);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <AdminProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, fetchProducts }}>
      {children}
    </AdminProductContext.Provider>
  );
}

export function useAdminProduct() {
  const context = useContext(AdminProductContext);
  if (!context) {
    throw new Error('useAdminProduct must be used within AdminProductProvider');
  }
  return context;
}
