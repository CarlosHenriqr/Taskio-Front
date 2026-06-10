import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute';
import { RootLayout } from '@/components/layout/RootLayout';
import { AdminLayout, EmpresaLayout, FreelancerLayout } from '@/components/layout/WorkspaceLayout';

// Public
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterFreelancerPage } from '@/pages/public/RegisterFreelancerPage';
import { RegisterCompanyPage } from '@/pages/public/RegisterCompanyPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';

// Empresa
import { EmpresaDashboardPage } from '@/pages/empresa/DashboardPage';
import { EmpresaProjectsPage } from '@/pages/empresa/ProjectsPage';
import { EmpresaJobDetailPage } from '@/pages/empresa/JobDetailPage';
import { EmpresaEditJobPage } from '@/pages/empresa/EditJobPage';
import { EmpresaPublishPage } from '@/pages/empresa/PublishJobPage';
import { EmpresaCandidatesPage } from '@/pages/empresa/CandidatesPage';
import { EmpresaCandidateDetailPage } from '@/pages/empresa/CandidateDetailPage';
import { EmpresaNotificationsPage } from '@/pages/empresa/NotificationsPage';

// Freelancer
import { FreelancerDashboardPage } from '@/pages/freelancer/DashboardPage';
import { FreelancerJobsPage } from '@/pages/freelancer/JobsPage';
import { FreelancerJobDetailPage } from '@/pages/freelancer/JobDetailPage';
import { FreelancerRecommendedPage } from '@/pages/freelancer/RecommendedPage';
import { FreelancerApplicationsPage } from '@/pages/freelancer/ApplicationsPage';
import { FreelancerApplicationDetailPage } from '@/pages/freelancer/ApplicationDetailPage';
import { FreelancerNotificationsPage } from '@/pages/freelancer/NotificationsPage';
import { FreelancerProfilePage } from '@/pages/freelancer/ProfilePage';
import { MyProfileViewPage } from '@/pages/freelancer/MyProfileViewPage';
import { FreelancerAccountPage } from '@/pages/freelancer/AccountPage';
import { EmpresaAccountPage } from '@/pages/empresa/AccountPage';

// Admin
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminJobsPage } from '@/pages/admin/JobsPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'termos', element: <TermsPage /> },
      { path: 'privacidade', element: <PrivacyPage /> },

      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'cadastro/freelancer', element: <RegisterFreelancerPage /> },
          { path: 'cadastro/empresa', element: <RegisterCompanyPage /> },
          { path: 'recuperar-senha', element: <ForgotPasswordPage /> },
        ],
      },

      {
        element: <ProtectedRoute allowedTypes={['company']} />,
        children: [
          {
            element: <EmpresaLayout />,
            children: [
              { path: 'empresa/dashboard', element: <EmpresaDashboardPage /> },
              { path: 'empresa/projetos', element: <EmpresaProjectsPage /> },
              { path: 'empresa/projetos/:id', element: <EmpresaJobDetailPage /> },
              { path: 'empresa/projetos/:id/editar', element: <EmpresaEditJobPage /> },
              { path: 'empresa/publicar', element: <EmpresaPublishPage /> },
              { path: 'empresa/candidatos', element: <EmpresaCandidatesPage /> },
              { path: 'empresa/candidatos/:id', element: <EmpresaCandidateDetailPage /> },
              { path: 'empresa/notificacoes', element: <EmpresaNotificationsPage /> },
              { path: 'empresa/conta', element: <EmpresaAccountPage /> },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute allowedTypes={['user']} />,
        children: [
          {
            element: <FreelancerLayout />,
            children: [
              { path: 'freelancer/dashboard', element: <FreelancerDashboardPage /> },
              { path: 'freelancer/vagas', element: <FreelancerJobsPage /> },
              { path: 'freelancer/vagas/:id', element: <FreelancerJobDetailPage /> },
              { path: 'freelancer/recomendadas', element: <FreelancerRecommendedPage /> },
              { path: 'freelancer/trabalhos', element: <FreelancerApplicationsPage /> },
              { path: 'freelancer/trabalhos/:id', element: <FreelancerApplicationDetailPage /> },
              { path: 'freelancer/notificacoes', element: <FreelancerNotificationsPage /> },
              { path: 'freelancer/perfil', element: <MyProfileViewPage /> },
              { path: 'freelancer/perfil/editar', element: <FreelancerProfilePage /> },
              { path: 'freelancer/curriculo', element: <Navigate to="/freelancer/perfil" replace /> },
              { path: 'freelancer/curriculo/editar', element: <Navigate to="/freelancer/perfil/editar" replace /> },
              { path: 'freelancer/conta', element: <FreelancerAccountPage /> },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin/dashboard', element: <AdminDashboardPage /> },
              { path: 'admin/usuarios', element: <AdminUsersPage /> },
              { path: 'admin/vagas', element: <AdminJobsPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
