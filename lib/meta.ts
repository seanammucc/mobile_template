import { AppEventsLogger, AppLink, Settings } from 'react-native-fbsdk-next';

/**
 * Initialize Meta SDK
 * 
 * Called after ATT prompt is resolved (whether granted or denied).
 * The SDK still works without IDFA - just with less accurate attribution.
 */
export const initMeta = () => {
  // Enable auto-logging of app events (installs, app opens)
  Settings.setAutoLogAppEventsEnabled(true);

  // Enable advertiser ID collection (only works if ATT granted)
  Settings.setAdvertiserIDCollectionEnabled(true);

  // Enable advertiser tracking (respects ATT status automatically)
  Settings.setAdvertiserTrackingEnabled(true);

  console.log('[Meta] SDK initialized');
};

/**
 * Fetch deferred deep link from Meta
 * 
 * This is the key for ad attribution. When a user:
 * 1. Clicks a Meta ad
 * 2. Gets sent to App Store
 * 3. Installs and opens the app
 * 
 * This function retrieves the original ad link with all tracking
 * parameters (fbclid, campaign_id, etc.) so Meta can attribute
 * this install to the correct ad.
 * 
 * Must be called on FIRST app open, AFTER ATT prompt and Meta init.
 * Returns the deferred deep link URL if one exists, null otherwise.
 */
export const fetchDeferredDeepLink = async (): Promise<string | null> => {
  try {
    console.log('[Meta] Checking for deferred deep link...');
    const url = await AppLink.fetchDeferredAppLink();

    if (url) {
      console.log('[Meta] Deferred deep link found:', url);
      return url;
    }

    console.log('[Meta] No deferred deep link found');
    return null;
  } catch (error) {
    // This is expected on non-first launches or when no ad click exists
    console.log('[Meta] No deferred deep link:', error);
    return null;
  }
};

/**
 * Track when user sees the paywall
 */
export const trackPaywallView = (paywallId?: string) => {
  AppEventsLogger.logEvent('ViewContent', {
    content_id: paywallId || 'paywall',
    content_type: 'paywall',
  });
  console.log('[Meta] Tracked: PaywallView');
};

/**
 * Track when user taps subscribe (before leaving for Stripe)
 */
export const trackInitiateCheckout = (price?: number, currency?: string) => {
  AppEventsLogger.logEvent('InitiatedCheckout', price || 0, {
    currency: currency || 'USD',
    content_type: 'subscription',
    num_items: '1',
  });
  console.log('[Meta] Tracked: InitiateCheckout');
};

/**
 * Track when user completes a purchase
 * Note: For Web Checkout this should be called when didRedeemLink fires
 * with SUCCESS, since the purchase happens in browser.
 */
export const trackPurchase = (price: number, currency?: string, productId?: string) => {
  AppEventsLogger.logPurchase(price, currency || 'USD', {
    content_id: productId || 'subscription',
    content_type: 'subscription',
    num_items: '1',
  });
  console.log('[Meta] Tracked: Purchase', price, currency);
};

/**
 * Track when user starts a free trial
 */
export const trackStartTrial = (price?: number, currency?: string) => {
  AppEventsLogger.logEvent('StartTrial', price || 0, {
    currency: currency || 'USD',
    content_type: 'subscription',
  });
  console.log('[Meta] Tracked: StartTrial');
};

/**
 * Track when user completes registration/onboarding
 */
export const trackCompleteRegistration = () => {
  AppEventsLogger.logEvent('CompleteRegistration');
  console.log('[Meta] Tracked: CompleteRegistration');
};

/**
 * Flush events - force send pending events to Meta
 */
export const flushMetaEvents = () => {
  AppEventsLogger.flush();
  console.log('[Meta] Events flushed');
};
