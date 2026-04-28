import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { ChangePasswordPage, EditProfilePage, ProfilePage } from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { StockInPage, StockOutPage } from './pages/StockPages';
import SuppliersPage from './pages/SuppliersPage';
import UserDetailPage from './pages/UserDetailPage';
import UsersPage from './pages/UsersPage';

function PrivatePage({ children }) {
  return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/' element={<PrivatePage><DashboardPage /></PrivatePage>} />
            <Route path='/profile' element={<PrivatePage><ProfilePage /></PrivatePage>} />
            <Route path='/profile/edit' element={<PrivatePage><EditProfilePage /></PrivatePage>} />
            <Route path='/profile/change-password' element={<PrivatePage><ChangePasswordPage /></PrivatePage>} />
            <Route path='/users' element={<PrivatePage><UsersPage /></PrivatePage>} />
            <Route path='/users/:id' element={<PrivatePage><UserDetailPage /></PrivatePage>} />
            <Route path='/categories' element={<PrivatePage><CategoriesPage /></PrivatePage>} />
            <Route path='/suppliers' element={<PrivatePage><SuppliersPage /></PrivatePage>} />
            <Route path='/items' element={<PrivatePage><ItemsPage /></PrivatePage>} />
            <Route path='/stock-in' element={<PrivatePage><StockInPage /></PrivatePage>} />
            <Route path='/stock-out' element={<PrivatePage><StockOutPage /></PrivatePage>} />
            <Route path='/reports' element={<PrivatePage><ReportsPage /></PrivatePage>} />
            <Route path='/settings' element={<PrivatePage><SettingsPage /></PrivatePage>} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
