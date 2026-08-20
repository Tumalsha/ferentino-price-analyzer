import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ViewPage from './pages/ViewPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminLandingPricePage from './pages/AdminLandingPricePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<ViewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/landing-price"
            element={
              <ProtectedRoute>
                <AdminLandingPricePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}
