import { getImageUrl } from '../api';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenu, user, onLogout }) {
  return <div className="bg-white dark:bg-gray-800 p-3 shadow flex justify-between items-center"><button onClick={onMenu} className="md:hidden">☰</button><ThemeToggle /><div className="flex items-center gap-3"><span className="dark:text-gray-200">{user?.full_name}</span>{user?.profile_image ? <img className='h-8 w-8 rounded-full' src={getImageUrl(user.profile_image)} alt='profile' /> : '👤'}<button className="text-red-600" onClick={onLogout}>Logout</button></div></div>;
}
