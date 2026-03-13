import type { ChangeEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Card } from '@starter/ui';
import { useAuth } from '../auth/AuthContext';
import { adminPushApi } from '../notifications/admin-push-api';

export const AdminPage = (): ReactElement => {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({ targetUserId: '', title: '', body: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFieldChange = (field: 'targetUserId' | 'title' | 'body') => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (): Promise<void> => {
    if (!accessToken) {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      await adminPushApi.sendToUser(accessToken, form);
      setMessage('Notificación enviada');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error enviando notificación');
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '1rem' }}>
      <Card title="Admin">
        <p>Área restringida para administradores.</p>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h3>Enviar push a usuario</h3>
          <input placeholder="User ID" value={form.targetUserId} onChange={onFieldChange('targetUserId')} />
          <input placeholder="Título" value={form.title} onChange={onFieldChange('title')} />
          <textarea placeholder="Mensaje" value={form.body} onChange={onFieldChange('body')} />
          <button type="button" onClick={() => void onSubmit()}>
            Enviar
          </button>
        </section>

        {message ? <p style={{ color: 'green' }}>{message}</p> : null}
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      </Card>
    </main>
  );
};
