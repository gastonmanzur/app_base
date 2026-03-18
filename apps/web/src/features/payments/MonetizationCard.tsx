import type { ReactElement } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from './payments-api';

interface Props {
  accessToken: string;
}

export const MonetizationCard = ({ accessToken }: Props): ReactElement => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const openCheckout = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onBuy = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await paymentsApi.createOneTime(accessToken, {
        title: 'Compra única Starter',
        amount: 2990,
        currency: 'ARS'
      });
      setLastOrderId(result.orderId);
      setLastStatus(result.status);
      setMessage(t('payments.pending'));
      openCheckout(result.checkoutUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('payments.error'));
    } finally {
      setLoading(false);
    }
  };

  const onRefreshStatus = async (): Promise<void> => {
    if (!lastOrderId) {
      return;
    }

    setSyncingStatus(true);
    setError(null);
    setMessage(null);
    try {
      const result = await paymentsApi.getOrderStatus(accessToken, lastOrderId, true);
      setLastStatus(result.status);
      setMessage(t('payments.statusUpdated'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('payments.error'));
    } finally {
      setSyncingStatus(false);
    }
  };

  return (
    <section style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
      <h3>{t('payments.title')}</h3>
      <p>{t('payments.subtitle')}</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={onBuy} disabled={loading}>
          {t('payments.buyOneTime')}
        </button>
        <button type="button" onClick={() => void onRefreshStatus()} disabled={syncingStatus || !lastOrderId}>
          {t('payments.refreshStatus')}
        </button>
      </div>
      {lastOrderId ? (
        <p>
          {t('payments.lastOrder')}: <code>{lastOrderId}</code>
          <br />
          {t('payments.currentStatus')}: <strong>{lastStatus ?? t('payments.unknown')}</strong>
        </p>
      ) : null}
      {message ? <p style={{ color: 'green' }}>{message}</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </section>
  );
};
