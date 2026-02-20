'use client';
// lib/hooks/usePaymentIntent.js
import { useEffect, useState } from 'react';
import { createPaymentIntent } from '@/lib/actions/checkout';

export function usePaymentIntent({ amount, currency }) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from sessionStorage on first mount
  useEffect(() => {
    const cachedSecret = sessionStorage.getItem('clientSecret');
    const cachedId = sessionStorage.getItem('paymentIntentId');

    if (cachedSecret && cachedId) {
      setClientSecret(cachedSecret);
      setPaymentIntentId(cachedId);
      setLoading(false);
    } else {
      initializePaymentIntent();
    }
  }, []);

  const initializePaymentIntent = async () => {
    try {
      setLoading(true);
      const res = await createPaymentIntent({
        amount,
        currency: currency.toLowerCase(),
      });

      if (res?.success && res.clientSecret && res.paymentIntent) {
        setClientSecret(res.clientSecret);
        setPaymentIntentId(res.paymentIntent);

        sessionStorage.setItem('clientSecret', res.clientSecret);
        sessionStorage.setItem('paymentIntentId', res.paymentIntent);
      } else {
        throw new Error('Failed to create PaymentIntent');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentIntent = () => {
    setClientSecret('');
    setPaymentIntentId('');
    setError(null);
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntentId');
  };

  return {
    clientSecret,
    paymentIntentId,
    loading,
    error,
    initializePaymentIntent,
    resetPaymentIntent,
  };
}
