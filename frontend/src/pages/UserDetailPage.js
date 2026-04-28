import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => { api(`/users/${id}`).then(setUser); }, [id]);
  if (!user) return <p className='dark:text-white'>Loading...</p>;
  return <div className='dark:text-white'><h2 className='text-2xl font-bold mb-4'>User Detail</h2><pre>{JSON.stringify(user, null, 2)}</pre></div>;
}
