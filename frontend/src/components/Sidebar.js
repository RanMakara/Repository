import { Link } from 'react-router-dom';

const links = [
  ['Dashboard', '/'], ['Users', '/users'], ['Categories', '/categories'], ['Suppliers', '/suppliers'], ['Items', '/items'], ['Stock In', '/stock-in'], ['Stock Out', '/stock-out'], ['Reports', '/reports'], ['Profile', '/profile'], ['Settings', '/settings']
];

export default function Sidebar({ open, onClose, schoolName, schoolLogo }) {
  return <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 transition bg-white dark:bg-gray-800 w-64 h-full p-4 shadow`}>
    <div className="flex items-center gap-2 mb-6">{schoolLogo ? <img src={schoolLogo} className="h-10 w-10 rounded" alt="logo" /> : <div>🏫</div>}<div className="font-bold dark:text-white">{schoolName || 'School'}</div><button className='ml-auto md:hidden' onClick={onClose}>✖</button></div>
    <nav className="space-y-2">{links.map(([name, path]) => <Link key={path} to={path} onClick={onClose} className="block p-2 rounded hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-700">{name}</Link>)}</nav>
  </aside>;
}
