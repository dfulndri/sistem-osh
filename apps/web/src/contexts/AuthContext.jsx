import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
      setIsAuthenticated(true);
    }
    setInitialLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAuthenticated(!!model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, passwordConfirm) => {
    try {
      const userData = {
        name,
        email,
        password,
        passwordConfirm,
        emailVisibility: true
      };
      
      const record = await pb.collection('users').create(userData);
      
      // Auto-login after registration
      await login(email, password);
      
      return { success: true, user: record };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const requestPasswordReset = async (email) => {
    try {
      await pb.collection('users').requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    initialLoading,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};