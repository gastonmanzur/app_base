import type { ChangeEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@starter/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../auth/auth-api';

const MAX_SIZE_BYTES = 2_097_152;

export const DashboardPage = (): ReactElement => {
  const { t } = useTranslation();
  const { user, accessToken, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(t('profile.avatar.invalidType'));
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(t('profile.avatar.invalidSize'));
      return;
    }

    if (!accessToken || !user) {
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const avatar = await authApi.uploadMyAvatar(accessToken, file);
      updateUser({ ...user, avatar });
      setFeedback(t('profile.avatar.uploadSuccess'));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('profile.avatar.unexpectedError'));
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const onDeleteAvatar = async (): Promise<void> => {
    if (!accessToken || !user) {
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      await authApi.deleteMyAvatar(accessToken);
      updateUser({ ...user, avatar: null });
      setFeedback(t('profile.avatar.deleteSuccess'));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t('profile.avatar.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '1rem' }}>
      <Card title={t('profile.title')}>
        <p>{t('profile.greeting', { email: user?.email ?? '-' })}</p>
        <p>{t('profile.role', { role: user?.role ?? '-' })}</p>

        <section>
          <h3>{t('profile.avatar.title')}</h3>
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={t('profile.avatar.alt')}
              width={96}
              height={96}
              style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
            />
          ) : (
            <p>{t('profile.avatar.empty')}</p>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarChange} disabled={loading} />
            <button type="button" onClick={onDeleteAvatar} disabled={loading || !user?.avatar}>
              {t('profile.avatar.delete')}
            </button>
          </div>

          {feedback ? <p style={{ color: 'green' }}>{feedback}</p> : null}
          {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        </section>

        <Link to="/change-password">{t('profile.changePassword')}</Link>
      </Card>
    </main>
  );
};
