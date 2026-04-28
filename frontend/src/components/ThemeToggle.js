import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="px-3 py-1 border rounded-lg dark:text-white" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '🌙 Dark'}</button>;
}
