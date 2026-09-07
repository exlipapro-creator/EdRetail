import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { Spinner } from './components/ui';
import App from './App';

// Admin portal is code-split: its Supabase queries and auth context never
// load for storefront visitors.
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Distributor portal pages (part of the main bundle for now — the distributor
// audience loads them directly via /portal links)
import { useDistributorStore } from './store/distributorStore';
import { DistributorLayout } from './distributor/components/DistributorLayout';
import { DistributorLoginPage } from './distributor/pages/DistributorLoginPage';
import { DistributorDashboardPage } from './distributor/pages/DistributorDashboardPage';
import { DistributorInventoryPage } from './distributor/pages/DistributorInventoryPage';
import { DistributorGoalsPage } from './distributor/pages/DistributorGoalsPage';
import { DistributorCrmPage } from './distributor/pages/DistributorCrmPage';
import { DistributorPaymentsPage } from './distributor/pages/DistributorPaymentsPage';
import { DistributorProfilePage } from './distributor/pages/DistributorProfilePage';

// Storefront Wrapper with LangProvider
function StorefrontRoute() {
  return (
    <LangProvider>
      <App />
    </LangProvider>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner />
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

  // 1. Super Admin Routes (AuthProvider lives inside the lazy AdminApp chunk)
  if (isAdmin) {
    return (
      <Suspense fallback={<AdminFallback />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
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
          <Route path="/portal/dashboard" element={<DistributorProtected><DistributorDashboardPage /></DistributorProtected>} />
          <Route path="/portal/ledger"    element={<DistributorProtected><DistributorDashboardPage /></DistributorProtected>} />
          <Route path="/portal/inventory" element={<DistributorProtected><DistributorInventoryPage /></DistributorProtected>} />
          <Route path="/portal/goals"     element={<DistributorProtected><DistributorGoalsPage /></DistributorProtected>} />
          <Route path="/portal/crm"       element={<DistributorProtected><DistributorCrmPage /></DistributorProtected>} />
          <Route path="/portal/payments"  element={<DistributorProtected><DistributorPaymentsPage /></DistributorProtected>} />
          <Route path="/portal/profile"   element={<DistributorProtected><DistributorProfilePage /></DistributorProtected>} />
          <Route path="/portal/storefront" element={<DistributorProtected><DistributorProfilePage /></DistributorProtected>} />
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
