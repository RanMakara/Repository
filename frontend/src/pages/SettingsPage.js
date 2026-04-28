import { useEffect, useState } from 'react';
import { api } from '../api';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import ImagePreviewUpload from '../components/ImagePreviewUpload';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { setSettings } = useAuth();
  const [form, setForm] = useState({ school_name: '', school_address: '', school_phone: '', school_email: '' });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => { api('/settings').then((s) => { setForm(s); setLogoPreview(s.school_logo); }); }, []);

  const save = async (e) => {
    e.preventDefault();
    const updated = await api('/settings', { method: 'PUT', body: JSON.stringify(form) });
    if (logo) { const fd = new FormData(); fd.append('logo', logo); const r = await api('/settings/upload-logo', { method: 'POST', body: fd }); updated.school_logo = r.school_logo; }
    setSettings(updated);
    alert('Settings updated');
  };

  return <form onSubmit={save} className='max-w-xl dark:text-white'><h2 className='text-2xl font-bold mb-4'>System Settings</h2><FormInput label='School Name' value={form.school_name || ''} onChange={(e)=>setForm({...form,school_name:e.target.value})} required /><FormInput label='School Address' value={form.school_address || ''} onChange={(e)=>setForm({...form,school_address:e.target.value})} /><FormInput label='School Phone' value={form.school_phone || ''} onChange={(e)=>setForm({...form,school_phone:e.target.value})} /><FormInput label='School Email' type='email' value={form.school_email || ''} onChange={(e)=>setForm({...form,school_email:e.target.value})} /><ImagePreviewUpload label='School Logo' value={logoPreview} onFileSelect={(f,url)=>{setLogo(f); setLogoPreview(url);}} /><Button type='submit'>Save Settings</Button></form>;
}
