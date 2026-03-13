import type { ReactElement } from 'react';
import { Card } from '@starter/ui';

export const AdminPage = (): ReactElement => {
  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '1rem' }}>
      <Card title="Admin">
        <p>Área restringida para administradores.</p>
      </Card>
    </main>
  );
};
