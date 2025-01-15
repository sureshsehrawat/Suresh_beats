import React, { useState } from 'react';
import { Volume2, Sun, Moon, Database, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { user, logout } = useAuth();
  const [userMessage, setUserMessage] = useState('');

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="bg-zinc-900 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Server Information
        </h2>
        <div className="space-y-2">
          <p className="text-zinc-400">
            <span className="font-medium text-white">Server:</span> beats.jatcloud.com
          </p>
          <p className="text-zinc-400">
            <span className="font-medium text-white">Username:</span> {user?.username}
          </p>
          <p className="text-zinc-400">
            <span className="font-medium text-white">Role:</span> {user?.isAdmin ? 'Admin' : 'User'}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Support
        </h2>
        <p className="text-zinc-400">
          For support or questions, please contact the server administrator.
        </p>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
} 