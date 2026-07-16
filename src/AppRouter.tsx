import { Routes, Route, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { AuthProvider, useAuth } from './admin/AuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { LoginPage }    from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { ProductsPage }  from './admin/pages/ProductsPage';
import { SalesPage }     from './admin/pages/SalesPage';
import { LoansPage }     from './admin/pages/LoansPage';
import { CashFlowPage }  from './admin/pages/CashFlowPage';
import { TestimonialsPage } from './admin/pages/TestimonialsPage';
import { Navigate }      from 'react-router-dom';
import App from './App';

// Lazy-load storefront only on non-admin routes to avoid LangContext pollution
function StorefrontRoute() {
  return (
    <LangProvider>
      <App />
    </LangProvider>
  );
}

function AdminLogin() {
  const { user, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return <LoginPage />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (!user) return <Navigate to="/admin" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function AdminSpinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AppRouter() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Wrap admin routes in AuthProvider, storefront in LangProvider
  // They never overlap so there's no context contamination
  if (isAdmin) {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/admin"           element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/admin/products"  element={<Protected><ProductsPage /></Protected>} />
          <Route path="/admin/sales"     element={<Protected><SalesPage /></Protected>} />
          <Route path="/admin/loans"     element={<Protected><LoansPage /></Protected>} />
          <Route path="/admin/cashflow"  element={<Protected><CashFlowPage /></Protected>} />
          <Route path="/admin/testimonials" element={<Protected><TestimonialsPage /></Protected>} />
          <Route path="/admin/*"         element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<StorefrontRoute />} />
    </Routes>
  );
}
