type EventType = 'copy_address' | 'view_qr' | 'page_view';
type PaymentMethod = 'UPI' | 'BTC' | 'ETH';

export const useDonationTracking = () => {
  const trackEvent = async (eventType: EventType, paymentMethod: PaymentMethod) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      await fetch(`${supabaseUrl}/functions/v1/track-donation-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          payment_method: paymentMethod,
        }),
      });
    } catch (error) {
      console.error('Failed to track donation event:', error);
    }
  };

  const trackCopyAddress = (paymentMethod: PaymentMethod) => {
    trackEvent('copy_address', paymentMethod);
  };

  const trackQRView = (paymentMethod: PaymentMethod) => {
    trackEvent('view_qr', paymentMethod);
  };

  const trackPageView = (paymentMethod: PaymentMethod) => {
    trackEvent('page_view', paymentMethod);
  };

  return {
    trackCopyAddress,
    trackQRView,
    trackPageView,
  };
};
