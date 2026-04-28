import { useState } from 'react';
import { getImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, settings, logout } = useAuth();
  return <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900"><Sidebar open={open} onClose={() => setOpen(false)} schoolName={settings?.school_name} schoolLogo={getImageUrl(settings?.school_logo)} /><main className="flex-1"><Navbar onMenu={() => setOpen(true)} user={user} onLogout={logout} /><div className="p-4">{children}</div></main></div>;
}
