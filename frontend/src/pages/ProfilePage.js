import { useState } from 'react';
import { api, getImageUrl } from '../api';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import ImagePreviewUpload from '../components/ImagePreviewUpload';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, refresh } = useAuth();
  return <div className='dark:text-white'><h2 className='text-2xl font-bold mb-4'>Profile</h2>{user?.profile_image && <img src={getImageUrl(user.profile_image)} className='h-24 w-24 rounded-full mb-3' alt='profile' />}<p><b>Username:</b> {user?.username}</p><p><b>Full name:</b> {user?.full_name}</p><p><b>Email:</b> {user?.email}</p><p><b>Role:</b> {user?.role}</p><Button className='mt-3' onClick={refresh}>Refresh</Button></div>;
}

export function EditProfilePage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [file, setFile] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    await api('/profile', { method: 'PUT', body: JSON.stringify(form) });
    if (file) { const fd = new FormData(); fd.append('image', file); await api('/profile/upload', { method: 'POST', body: fd }); }
    await refresh();
    alert('Profile updated');
  };
  return <form onSubmit={save} className='max-w-lg dark:text-white'><h2 className='text-2xl font-bold mb-4'>Edit Profile</h2><FormInput label='Full Name' value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /><FormInput label='Email' type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><ImagePreviewUpload label='Profile Image' value={user?.profile_image} onFileSelect={(f) => setFile(f)} /><Button type='submit'>Save Changes</Button></form>;
}

export function ChangePasswordPage() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const save = async (e) => {
    e.preventDefault();
    await api('/profile/change-password', { method: 'POST', body: JSON.stringify(form) });
    alert('Password changed');
    setForm({ old_password: '', new_password: '', confirm_password: '' });
  };
  return <form onSubmit={save} className='max-w-lg dark:text-white'><h2 className='text-2xl font-bold mb-4'>Change Password</h2><FormInput type='password' label='Old Password' value={form.old_password} onChange={(e) => setForm({ ...form, old_password: e.target.value })} required /><FormInput type='password' label='New Password' value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required /><FormInput type='password' label='Confirm Password' value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required /><Button type='submit'>Update Password</Button></form>;
}
