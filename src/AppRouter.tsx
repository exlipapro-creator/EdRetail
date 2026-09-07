import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { useDistributorStore } from './store/distributorStore';
import { Spinner } from './components/ui';
import App from './App';

// Admin portal is code-split: its Supabase queries and auth context never
// load for storefront visitors.
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Distributor portal is code-split the same way: storefront visitors never
// download portal pages, the portal shell, or their heavy panels (chat,
// payments, inventory). The Zustand distributorStore stays in the main
// bundle — the storefront itself and the auth gate below depend on it.
const DistributorLayout = lazy(() =>
  import('./distributor/components/DistributorLayout').then((m) => ({ default: m.DistributorLayout }))
);
const DistributorLoginPage = lazy(() =>
  import('./distributor/pages/DistributorLoginPage').then((m) => ({ default: m.DistributorLoginPage }))
);
const DistributorDashboardPage = lazy(() =>
  import('./distributor/pages/DistributorDashboardPage').then((m) => ({ default: m.DistributorDashboardPage }))
);
const DistributorInventoryPage = lazy(() =>
  import('./distributor/pages/DistributorInventoryPage').then((m) => ({ default: m.DistributorInventoryPage }))
);
const DistributorGoalsPage = lazy(() =>
  import('./distributor/pages/DistributorGoalsPage').then((m) => ({ default: m.DistributorGoalsPage }))
);
const DistributorCrmPage = lazy(() =>
  import('./distributor/pages/DistributorCrmPage').then((m) => ({ default: m.DistributorCrmPage }))
);
const DistributorPaymentsPage = lazy(() =>
  import('./distributor/pages/DistributorPaymentsPage').then((m) => ({ default: m.DistributorPaymentsPage }))
);
const DistributorProfilePage = lazy(() =>
  import('./distributor/pages/DistributorProfilePage').then((m) => ({ default: m.DistributorProfilePage }))
);

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

// Portal chunk loading fallback — dark to match the portal shell (no white flash)
function PortalFallback() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Spinner className="text-white" />
    </div>
  );
}

// Distributor Portal Auth Protection
// The store gate stays synchronous and in the main bundle: an unauthenticated
// visitor is redirected before any portal chunk is downloaded.
function DistributorProtected({ children }: { children: React.ReactNode }) {
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  if (!isAdminAuthenticated) {
    return <Navigate to="/portal" replace />;
  }
  return (
    <Suspense fallback={<PortalFallback />}>
      <DistributorLayout>{children}</DistributorLayout>
    </Suspense>
  );
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
        <Suspense fallback={<PortalFallback />}>
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
        </Suspense>
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
