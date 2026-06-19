import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute';
import { RootLayout } from '@/components/layout/RootLayout';
import { EmpresaLayout, FreelancerLayout } from '@/components/layout/WorkspaceLayout';

// Public
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';
import { PlansPage } from '@/pages/public/PlansPage';

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

function FreelancerJobDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/freelancer/projetos/${id}` : '/freelancer/projetos'} replace />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'planos', element: <PlansPage /> },
      { path: 'termos', element: <TermsPage /> },
      { path: 'privacidade', element: <PrivacyPage /> },

      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'login/freelancer', element: <LoginPage initialType="user" /> },
          { path: 'login/empresa', element: <LoginPage initialType="company" /> },
          { path: 'cadastro', element: <RegisterPage /> },
          { path: 'cadastro/freelancer', element: <RegisterPage initialType="user" /> },
          { path: 'cadastro/empresa', element: <RegisterPage initialType="company" /> },
          { path: 'recuperar-senha', element: <ForgotPasswordPage /> },
          { path: 'recuperar-senha/empresa', element: <ForgotPasswordPage accountType="company" /> },
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
              { path: 'freelancer/projetos', element: <FreelancerJobsPage /> },
              { path: 'freelancer/projetos/:id', element: <FreelancerJobDetailPage /> },
              { path: 'freelancer/vagas', element: <Navigate to="/freelancer/projetos" replace /> },
              { path: 'freelancer/vagas/:id', element: <FreelancerJobDetailRedirect /> },
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

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
