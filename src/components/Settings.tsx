import React, { useState, useRef } from 'react';
import { Volume2, Sun, Moon, Database, Mail, UserPlus, LogOut, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function Settings() {
  const { user, logout, createUser, updateProfilePhoto } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setUserMessage('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const success = await createUser(newUsername, newPassword);
      if (success) {
        setUserMessage('User created successfully');
        setNewUsername('');
        setNewPassword('');
      } else {
        setUserMessage('Failed to create user. Username might already exist.');
      }
    } catch (error) {
      setUserMessage('An error occurred while creating the user');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setUserMessage('You must be logged in to upload photos');
      return;
    }

    setPhotoLoading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.username}-${Date.now()}.${fileExt}`;

      console.log('Attempting to upload file:', fileName);

      // Upload the file with anon key
      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Update user profile with photo URL
      const success = await updateProfilePhoto(publicUrl);
      if (!success) {
        console.error('Failed to update user profile with photo URL');
        throw new Error('Failed to update profile photo');
      }

      setUserMessage('Profile photo updated successfully');
    } catch (error) {
      console.error('Error in photo upload process:', error);
      // More detailed error message
      if (error instanceof Error) {
        setUserMessage(`Upload failed: ${error.message}`);
      } else {
        setUserMessage('Failed to upload profile photo');
      }
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={logout}
          className="flex items-center space-x-2 bg-[#FF9900] hover:bg-[#FF8000] text-white px-4 py-2 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
                {user?.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Camera size={32} />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
                disabled={photoLoading}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={photoLoading}
              />
            </div>
            <div className="text-sm text-zinc-400">
              {photoLoading ? 'Uploading...' : 'Click to upload profile photo'}
            </div>
          </div>
        </div>

        {user?.isAdmin && (
          <div className="bg-zinc-900 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              User Management
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-zinc-800 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-800 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>
              {userMessage && (
                <div className={`text-sm ${userMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                  {userMessage}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-zinc-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Audio</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-zinc-400" />
                <span>Streaming Quality</span>
              </div>
              <select className="bg-zinc-800 rounded-md px-3 py-2 text-sm">
                <option>High (320 kbps)</option>
                <option>Medium (160 kbps)</option>
                <option>Low (96 kbps)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sun className="w-5 h-5 text-zinc-400" />
                <span>Theme</span>
              </div>
              <select className="bg-zinc-800 rounded-md px-3 py-2 text-sm">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800">
          <div className="text-center text-zinc-400">
            <p className="mb-4">Designed & Developed by Suresh Sehrawat</p>
            <p className="mb-6">© 2024 All rights reserved</p>
            <a 
              href="mailto:sureshsehrawat@gmail.com"
              className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Me</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 