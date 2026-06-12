import { Navigate } from 'react-router-dom';

export function FreelancerAccountPage() {
  return <Navigate to="/freelancer/perfil/editar?secao=conta" replace />;
}
