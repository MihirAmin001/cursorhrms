import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserRecord = async (userId: string, email: string) => {
    try {
      // Check if user exists in cursorhrms_users
      const { data, error } = await supabase
        .from('cursorhrms_users')
        .select('*')
        .eq('id', userId);

      if (error) throw error;

      // If user doesn't exist, create a new record
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('cursorhrms_users')
          .insert([
            { 
              id: userId, 
              email: email,
              role: 'employee' // Default role
            }
          ]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error ensuring user record:', error);
      throw error;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const userEmail = (await supabase.auth.getUser()).data.user?.email || '';
      
      // First, check if user exists in cursorhrms_users
      const { data: existingUser, error: fetchError } = await supabase
        .from('cursorhrms_users')
        .select('role, email')
        .eq('id', userId);

      if (fetchError) throw fetchError;

      // If user doesn't exist, create a new record
      if (!existingUser || existingUser.length === 0) {
        const { error: insertError } = await supabase
          .from('cursorhrms_users')
          .insert([
            {
              id: userId,
              email: userEmail,
              role: 'employee' // Default role
            }
          ]);

        if (insertError) throw insertError;

        // Set the user state with the newly created record
        setUser({
          id: userId,
          email: userEmail,
          role: 'employee'
        });
      } else {
        // User exists, set the state with the existing data
        const userData = existingUser[0];
        setUser({
          id: userId,
          email: userData.email,
          role: userData.role
        });
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      // Set a default user state in case of error
      setUser({
        id: userId,
        email: (await supabase.auth.getUser()).data.user?.email || '',
        role: 'employee'
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Ensure user record exists after successful sign in
      if (data.user) {
        await ensureUserRecord(data.user.id, data.user.email || '');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create user record in cursorhrms_users
        const { error: profileError } = await supabase
          .from('cursorhrms_users')
          .insert([
            { id: data.user.id, email, role }
          ]);
        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 