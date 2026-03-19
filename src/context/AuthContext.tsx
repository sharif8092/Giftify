import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserProfile } from '../types';
import { orderService } from '../services/orderService';
import wooCommerceService, { wpService } from '../services/wooCommerceService';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/woo/jwt-auth/v1/token', {
        username: email,
        password: password
      });

      const { token, user_email } = response.data as any;
      
      localStorage.setItem('wc_jwt_token', token);
      
      // Fetch full profile from WooCommerce
      await fetchProfile(token, user_email);
    } catch (err: any) {
      console.error("WooCommerce Login Error:", err);
      if (err.response?.status === 404 || err.message?.includes('404')) {
        throw new Error("LOGIN SERVICE (JWT) IS NOT CONFIGURED ON THE SERVER. PLEASE ENSURE THE 'JWT AUTHENTICATION' PLUGIN IS ACTIVE ON YOUR WORDPRESS SITE.");
      }
      throw new Error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      
      // Split display name into first and last
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await wooCommerceService.post('/customers', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: email // Use full email as username to avoid collisions
      });

      // 2. Automatically login after successful signup
      await login(email, password);
    } catch (err: any) {
      console.error("WooCommerce Signup Error:", err);
      if (err.response?.data?.code === 'registration-error-email-exists') {
        throw new Error("This email is already registered. Please login instead.");
      }
      throw new Error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (token: string, email: string) => {
    try {
      // Get WordPress user info
      const wpUserResponse = await wpService.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const wpUser = wpUserResponse.data as any;

      // Get WooCommerce customer info
      const wcId = await orderService.getOrCreateCustomer({ email });

      const newProfile: UserProfile = {
        uid: wpUser.id.toString(),
        email: email,
        displayName: wpUser.name || '',
        photoURL: wpUser.avatar_urls?.['96'] || '',
        phone: '', 
        role: wpUser.roles?.includes('administrator') ? 'admin' : 'customer',
        wcCustomerId: wcId > 0 ? wcId : undefined
      };

      setProfile(newProfile);
      setUser({ email });
    } catch (err) {
      console.error("Fetch Profile Error:", err);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      await wpService.post('/users/lost-password', { user_login: email });
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      throw new Error(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
      setLoading(true);
      await wpService.post('/users/reset-password', {
        user_login: email,
        reset_key: token,
        new_password: newPassword
      });
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      throw new Error(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    // Basic local update, real update would need WP API call
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const logout = async () => {
    localStorage.removeItem('wc_jwt_token');
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('wc_jwt_token');
      
      if (token) {
        try {
          // Validate token and fetch profile
          const validateResponse = await axios.post('/api/woo/jwt-auth/v1/token/validate', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (validateResponse.status === 200) {
            const meResponse = await wpService.get('/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const userData = meResponse.data as any;
            await fetchProfile(token, userData.email || userData.user_email);
          }
        } catch (err) {
          console.error("Token Validation Error:", err);
          localStorage.removeItem('wc_jwt_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.email === 'sharifkmrn@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, signup, updateProfile, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
