// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — MASTER APPLICATION ROOT & ROUTER
// Context providers, custom cursor mount, and protected route architecture.
// ==============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CursorProvider } from './context/CursorContext';
import { EngineeringCursor } from './components/cursor/EngineeringCursor';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { IntroPage } from './pages/IntroPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { QrCodePage } from './pages/QrCodePage';

// Admin Architecture
import { AdminGuard } from './admin/AdminGuard';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { AdminResetPassword } from './admin/AdminResetPassword';
import { AdminUnauthorized } from './admin/AdminUnauthorized';

// Admin Modules
import { Dashboard } from './admin/modules/Dashboard';
import { ProfileEditor } from './admin/modules/ProfileEditor';
import { AboutEditor } from './admin/modules/AboutEditor';
import { SkillsManager } from './admin/modules/SkillsManager';
import { ProjectsManager } from './admin/modules/ProjectsManager';
import { CadCaeManager } from './admin/modules/CadCaeManager';
import { PlcManager } from './admin/modules/PlcManager';
import { CertsManager } from './admin/modules/CertsManager';
import { AiEngManager } from './admin/modules/AiEngManager';
import { ArticlesManager } from './admin/modules/ArticlesManager';
import { VisibilityManager } from './admin/modules/VisibilityManager';
import { VisualizationSettings } from './admin/modules/VisualizationSettings';
import { ContactMessages } from './admin/modules/ContactMessages';
import { SystemDiagnostics } from './admin/modules/SystemDiagnostics';
import { SectionBuilder } from './admin/modules/SectionBuilder';
import { NavigationManager } from './admin/modules/NavigationManager';
import { ResearchManager } from './admin/modules/ResearchManager';
import { ConnectionsManager } from './admin/modules/ConnectionsManager';
import { PolygonNetworkBackground } from './components/background/PolygonNetworkBackground';

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Core Application Subsystem Fault">
      <AuthProvider>
        <CursorProvider>
          {/* Persistent Aerospace Low-Poly Network Canvas Engine */}
          <PolygonNetworkBackground />

          {/* Engineering Instrumentation Cursor & Touch Telemetry */}
          <EngineeringCursor />

          <BrowserRouter>
            <Routes>
              {/* Cinematic Introduction Entry */}
              <Route path="/" element={<IntroPage />} />

              {/* Main Laboratory Portfolio */}
              <Route path="/portfolio" element={<PortfolioPage />} />

              {/* Standalone Optical Handshake QR Terminal */}
              <Route path="/qr" element={<QrCodePage />} />

              {/* Admin Auth Endpoints */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

              {/* Protected Admin CMS Dashboard */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="sections" element={<SectionBuilder />} />
                <Route path="navigation" element={<NavigationManager />} />
                <Route path="profile" element={<ProfileEditor />} />
                <Route path="research" element={<ResearchManager />} />
                <Route path="about" element={<AboutEditor />} />
                <Route path="skills" element={<SkillsManager />} />
                <Route path="projects" element={<ProjectsManager />} />
                <Route path="cad-cae" element={<CadCaeManager />} />
                <Route path="plc" element={<PlcManager />} />
                <Route path="certifications" element={<CertsManager />} />
                <Route path="ai-engineering" element={<AiEngManager />} />
                <Route path="articles" element={<ArticlesManager />} />
                <Route path="connections" element={<ConnectionsManager />} />
                <Route path="visibility" element={<VisibilityManager />} />
                <Route path="visualization" element={<VisualizationSettings />} />
                <Route path="messages" element={<ContactMessages />} />
                <Route path="diagnostics" element={<SystemDiagnostics />} />
              </Route>

              {/* Fallback to Intro */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CursorProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
