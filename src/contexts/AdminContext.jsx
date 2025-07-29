import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (email, password) => {
    try {
      setLoading(true);
      console.log('\uD83D\uDC64 Admin login attempt:', email);

      const { data: adminData, error } = await supabase
        .from('admins_sm2024')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password_hash', password)
        .eq('is_active', true)
        .single();

      if (error || !adminData) {
        console.error('Admin login error:', error);
        return {
          success: false,
          error: '\u30E1\u30A4\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u307E\u308B\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3067\u306F\u306A\u3053\u3068\u3067\u3059'
        };
      }

      // \u6700\u7D66\u30ED\u30B0\u30A4\u30F3\u6642\u69D9\u3092\u66F4\u65B0
      await supabase
        .from('admins_v2_sm2024')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminData.id);

      const adminInfo = {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role
      };

      setAdmin(adminInfo);
      localStorage.setItem('admin_session', JSON.stringify(adminInfo));

      // \u30ED\u30B0\u30A4\u30F3\u6210\u529F\u30E1\u30C3\u30BB\u30FC\u30B8
      alert(`\u2705 \u30ED\u30B0\u30A4\u30F3\u3057\u305F\u307E\u3059！\n\uD83D\uDC64 ${adminInfo.name}\n\uD83D\uDCE7 ${adminInfo.email}`);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
  };

  const value = {
    admin,
    loading,
    loginAdmin,
    logoutAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;