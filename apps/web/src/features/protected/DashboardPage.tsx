import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@starter/ui';
import { useAuth } from '../auth/AuthContext';

export const DashboardPage = (): ReactElement => {
  const { user } = useAuth();

  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '1rem' }}>
      <Card title="Dashboard">
        <p>Hola {user?.email}</p>
        <p>Rol: {user?.role}</p>
        <Link to="/change-password">Cambiar contraseña</Link>
      </Card>
    </main>
  );
};
