import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  username: string;
  isAdmin: boolean;
  profilePhoto: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (username: string, password: string) => Promise<boolean>;
  updateProfilePhoto: (photoUrl: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // Initialize the users table if it doesn't exist
    const initializeDb = async () => {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('username')
        .eq('username', 'suresh');

      if (!existingUsers?.length) {
        // Add the default admin user
        await supabase
          .from('users')
          .insert([
            {
              username: 'suresh',
              password: 'chickchick',
              is_admin: true,
              profile_photo: null
            }
          ]);
      }
    };

    initializeDb();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !users) {
      return false;
    }

    setUser({ 
      username: users.username, 
      isAdmin: users.is_admin,
      profilePhoto: users.profile_photo 
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const createUser = async (username: string, password: string): Promise<boolean> => {
    if (!user?.isAdmin) return false;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return false;
    }

    // Create new user
    const { error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password,
          is_admin: false,
          profile_photo: null
        }
      ]);

    return !error;
  };

  const updateProfilePhoto = async (photoUrl: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({ profile_photo: photoUrl })
      .eq('username', user.username);

    if (!error) {
      setUser({ ...user, profilePhoto: photoUrl });
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, createUser, updateProfilePhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 