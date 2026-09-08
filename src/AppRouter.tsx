import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { useDistributorStore } from './store/distributorStore';
import { Spinner } from './components/ui';
import { supabase } from './lib/supabase';
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
const DistributorSalesPage = lazy(() =>
  import('./distributor/pages/DistributorSalesPage').then((m) => ({ default: m.DistributorSalesPage }))
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
const DistributorStorefrontPage = lazy(() =>
  import('./distributor/pages/DistributorStorefrontPage').then((m) => ({ default: m.DistributorStorefrontPage }))
);
const DistributorResetPasswordPage = lazy(() =>
  import('./distributor/pages/DistributorResetPasswordPage').then((m) => ({ default: m.DistributorResetPasswordPage }))
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

// Portal chunk loading fallback — light to match the portal shell
function PortalFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
}

// Distributor Portal Auth Protection
// The REAL Supabase session is the authority — the persisted store flag is
// UI-only state and can never grant access by itself. While the session is
// being verified nothing but the spinner renders, so an unauthenticated
// visitor never downloads portal chunks. A stale or expired session is
// redirected to /portal cleanly.
function DistributorProtected({ children }: { children: React.ReactNode }) {
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        const hasSession = !!data.session;
        setAuthenticated(hasSession);
        // Mirror the authoritative session into UI state.
        setAdminAuthenticated(hasSession);
        setChecking(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthenticated(false);
        setAdminAuthenticated(false);
        setChecking(false);
      });
    return () => { cancelled = true; };
  }, [setAdminAuthenticated]);

  if (checking) return <PortalFallback />;
  if (!authenticated) return <Navigate to="/portal" replace />;
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
            <Route path="/portal/reset-password" element={<DistributorResetPasswordPage />} />
            <Route path="/distributor/login" element={<DistributorLoginPage />} />
            <Route path="/distributor" element={<DistributorLoginPage />} />

            {/* Protected Distributor Operations Portal */}
            <Route path="/portal/dashboard" element={<DistributorProtected><DistributorDashboardPage /></DistributorProtected>} />
            <Route path="/portal/ledger"    element={<DistributorProtected><DistributorSalesPage /></DistributorProtected>} />
            <Route path="/portal/inventory" element={<DistributorProtected><DistributorInventoryPage /></DistributorProtected>} />
            <Route path="/portal/goals"     element={<DistributorProtected><DistributorGoalsPage /></DistributorProtected>} />
            <Route path="/portal/crm"       element={<DistributorProtected><DistributorCrmPage /></DistributorProtected>} />
            <Route path="/portal/payments"  element={<DistributorProtected><DistributorPaymentsPage /></DistributorProtected>} />
            <Route path="/portal/profile"   element={<DistributorProtected><DistributorProfilePage /></DistributorProtected>} />
            <Route path="/portal/storefront" element={<DistributorProtected><DistributorStorefrontPage /></DistributorProtected>} />
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
