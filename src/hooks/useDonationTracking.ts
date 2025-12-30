import { supabase } from "@/integrations/supabase/client";

type EventType = 'copy_address' | 'view_qr' | 'page_view';
type PaymentMethod = 'UPI' | 'BTC' | 'ETH';

export const useDonationTracking = () => {
  const trackEvent = async (eventType: EventType, paymentMethod: PaymentMethod) => {
    try {
      await supabase.from('donation_events').insert({
        event_type: eventType,
        payment_method: paymentMethod,
        user_agent: navigator.userAgent,
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
