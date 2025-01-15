import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call the Airsonic ping API first to verify credentials
      const pingResponse = await fetch(
        `https://beats.jatcloud.com/rest/ping?u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}&v=1.13.0&c=spotify-clone&f=json`
      );

      if (!pingResponse.ok) {
        console.error('Ping failed:', pingResponse.status);
        return false;
      }

      const pingData = await pingResponse.json();
      if (pingData['subsonic-response'].status !== 'ok') {
        console.error('Ping response not ok:', pingData['subsonic-response']);
        return false;
      }

      // If ping successful, get user details
      const userResponse = await fetch(
        `https://beats.jatcloud.com/rest/getUser?u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}&v=1.13.0&c=spotify-clone&f=json&username=${encodeURIComponent(username)}`
      );

      if (!userResponse.ok) {
        console.error('User fetch failed:', userResponse.status);
        return false;
      }

      const userData = await userResponse.json();
      if (userData['subsonic-response'].status !== 'ok') {
        console.error('User response not ok:', userData['subsonic-response']);
        return false;
      }

      const user = userData['subsonic-response'].user;
      setUser({ 
        username: user.username,
        isAdmin: user.adminRole
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear stored password
    if (user) {
      localStorage.removeItem(`password_${user.username}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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