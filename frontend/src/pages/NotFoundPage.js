import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className='p-8 dark:text-white'><h1 className='text-3xl font-bold'>404 - Not Found</h1><Link className='text-blue-600 underline' to='/'>Go Dashboard</Link></div>;
}
