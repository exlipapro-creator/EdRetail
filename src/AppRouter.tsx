import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { AuthProvider, useAuth } from './admin/AuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { LoginPage as AdminLoginPage } from './admin/pages/LoginPage';
import { DashboardPage as AdminDashboardPage } from './admin/pages/DashboardPage';
import { ProductsPage as AdminProductsPage } from './admin/pages/ProductsPage';
import { DistributorsPage as AdminDistributorsPage } from './admin/pages/DistributorsPage';
import { SalesPage as AdminSalesPage } from './admin/pages/SalesPage';
import { LoansPage as AdminLoansPage } from './admin/pages/LoansPage';
import { CashFlowPage as AdminCashFlowPage } from './admin/pages/CashFlowPage';
import { TestimonialsPage as AdminTestimonialsPage } from './admin/pages/TestimonialsPage';
import { SettingsPage as AdminSettingsPage } from './admin/pages/SettingsPage';

import { useDistributorStore } from './store/distributorStore';
import { DistributorLayout } from './distributor/components/DistributorLayout';
import { DistributorLoginPage } from './distributor/pages/DistributorLoginPage';
import { DistributorDashboardPage } from './distributor/pages/DistributorDashboardPage';
import { DistributorInventoryPage } from './distributor/pages/DistributorInventoryPage';
import { DistributorGoalsPage } from './distributor/pages/DistributorGoalsPage';
import { DistributorCrmPage } from './distributor/pages/DistributorCrmPage';
import { DistributorPaymentsPage } from './distributor/pages/DistributorPaymentsPage';
import { DistributorProfilePage } from './distributor/pages/DistributorProfilePage';

import App from './App';

// Storefront Wrapper with LangProvider
function StorefrontRoute() {
  return (
    <LangProvider>
      <App />
    </LangProvider>
  );
}

// Super Admin Auth Protection
function AdminLogin() {
  const { user, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLoginPage />;
}

function AdminProtected({ children }: { children: React.ReactNode }) {
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

// Distributor Portal Auth Protection
function DistributorProtected({ children }: { children: React.ReactNode }) {
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  if (!isAdminAuthenticated) {
    return <Navigate to="/portal" replace />;
  }
  return <DistributorLayout>{children}</DistributorLayout>;
}

export function AppRouter() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isPortal = pathname.startsWith('/portal') || pathname.startsWith('/distributor');

  // 1. Super Admin Routes (Wrapped in AuthProvider)
  if (isAdmin) {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtected><AdminDashboardPage /></AdminProtected>} />
          <Route path="/admin/products" element={<AdminProtected><AdminProductsPage /></AdminProtected>} />
          <Route path="/admin/distributors" element={<AdminProtected><AdminDistributorsPage /></AdminProtected>} />
          <Route path="/admin/sales" element={<AdminProtected><AdminSalesPage /></AdminProtected>} />
          <Route path="/admin/loans" element={<AdminProtected><AdminLoansPage /></AdminProtected>} />
          <Route path="/admin/cashflow" element={<AdminProtected><AdminCashFlowPage /></AdminProtected>} />
          <Route path="/admin/testimonials" element={<AdminProtected><AdminTestimonialsPage /></AdminProtected>} />
          <Route path="/admin/settings" element={<AdminProtected><AdminSettingsPage /></AdminProtected>} />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    );
  }

  // 2. Dedicated Distributor Portal Routes (Wrapped in LangProvider)
  if (isPortal) {
    return (
      <LangProvider>
        <Routes>
          {/* Dedicated Redesigned Distributor Login & Register Page */}
          <Route path="/portal" element={<DistributorLoginPage />} />
          <Route path="/portal/login" element={<DistributorLoginPage />} />
          <Route path="/distributor/login" element={<DistributorLoginPage />} />
          <Route path="/distributor" element={<DistributorLoginPage />} />

          {/* Protected Distributor Operations Portal */}
          <Route
            path="/portal/dashboard"
            element={
              <DistributorProtected>
                <DistributorDashboardPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/ledger"
            element={
              <DistributorProtected>
                <DistributorDashboardPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/inventory"
            element={
              <DistributorProtected>
                <DistributorInventoryPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/goals"
            element={
              <DistributorProtected>
                <DistributorGoalsPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/crm"
            element={
              <DistributorProtected>
                <DistributorCrmPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/payments"
            element={
              <DistributorProtected>
                <DistributorPaymentsPage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/profile"
            element={
              <DistributorProtected>
                <DistributorProfilePage />
              </DistributorProtected>
            }
          />
          <Route
            path="/portal/storefront"
            element={
              <DistributorProtected>
                <DistributorProfilePage />
              </DistributorProtected>
            }
          />
          <Route path="/portal/*" element={<Navigate to="/portal/dashboard" replace />} />
        </Routes>
      </LangProvider>
    );
  }

  // 3. Public Storefront Routes
  return (
    <Routes>
      <Route path="/*" element={<StorefrontRoute />} />
    </Routes>
  );
}
