import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await login(username, password); navigate('/'); }
    catch (err) { setError(err.message); }
  };

  return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><form onSubmit={submit} className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-96'><h1 className='text-2xl font-bold mb-4 dark:text-white'>School Stock Login</h1>{error && <p className='bg-red-100 text-red-700 p-2 rounded mb-2'>{error}</p>}<FormInput label='Username' value={username} onChange={(e) => setUsername(e.target.value)} required /><FormInput label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required /><Button type='submit' className='w-full'>Login</Button></form></div>;
}
