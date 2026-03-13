import type { ReactElement } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@starter/ui';
import { notificationsApi } from './notifications-api';
import { getWebNotificationPermission, requestWebPushToken } from './web-push';

interface Props {
  accessToken: string;
}

export const WebPushCard = ({ accessToken }: Props): ReactElement => {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(getWebNotificationPermission());
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onEnable = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const nextToken = await requestWebPushToken();
      await notificationsApi.registerDevice(accessToken, { token: nextToken, platform: 'web', channel: 'web_push' });
      setToken(nextToken);
      setPermission(getWebNotificationPermission());
      setMessage(t('profile.push.enabled'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('profile.push.error'));
      setPermission(getWebNotificationPermission());
    } finally {
      setLoading(false);
    }
  };

  const onDisable = async (): Promise<void> => {
    if (!token) {
      setError(t('profile.push.disableNeedsToken'));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await notificationsApi.unregisterDevice(accessToken, token);
      setToken(null);
      setMessage(t('profile.push.disabled'));
    } catch (disableError) {
      setError(disableError instanceof Error ? disableError.message : t('profile.push.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t('profile.push.title')}>
      <p>{t('profile.push.permission', { status: permission })}</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={() => void onEnable()} disabled={loading || permission === 'unsupported'}>
          {t('profile.push.enable')}
        </button>
        <button type="button" onClick={() => void onDisable()} disabled={loading || !token}>
          {t('profile.push.disable')}
        </button>
      </div>
      {message ? <p style={{ color: 'green' }}>{message}</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </Card>
  );
};
