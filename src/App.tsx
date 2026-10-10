// ============================================================================
// Dynamo Fitness Club — Application Router & Root Providers
// ============================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { RequireAuth } from '@/app/RequireAuth';
import { AdminLayout } from '@/app/AdminLayout';

// Public & Auth Pages
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

// Admin Pages
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MembersListPage } from '@/features/members/MembersListPage';
import { AddMemberPage } from '@/features/members/AddMemberPage';
import { MemberProfilePage } from '@/features/members/MemberProfilePage';
import { PlansPage } from '@/features/plans/PlansPage';
import { PaymentsListPage } from '@/features/payments/PaymentsListPage';
import { ReceiptsListPage } from '@/features/receipts/ReceiptsListPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { EnquiriesPage } from '@/features/enquiries/EnquiriesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AuditLogPage } from '@/features/audit/AuditLogPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Admin Console */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="members" element={<MembersListPage />} />
            <Route path="members/add" element={<AddMemberPage />} />
            <Route path="members/:id" element={<MemberProfilePage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="payments" element={<PaymentsListPage />} />
            <Route path="receipts" element={<ReceiptsListPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
