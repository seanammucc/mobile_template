import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SUPERWALL_API_KEY, CAMPAIGN_TRIGGER } from '@/lib/superwall';
import { initMeta, fetchDeferredDeepLink, trackPaywallView, trackInitiateCheckout, trackPurchase } from '@/lib/meta';
import {
  SuperwallProvider,
  SuperwallLoading,
  SuperwallLoaded,
  SuperwallError,
  usePlacement,
  useSuperwallEvents,
  useUser,
} from 'expo-superwall';
import { ActivityIndicator, View, Text, Platform } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

function SuperwallEventHandler() {
  const router = useRouter();

  useSuperwallEvents({
    willRedeemLink: () => {
      console.log('[Superwall] willRedeemLink - Redemption starting...');
    },
    didRedeemLink: (result) => {
      console.log('[Superwall] didRedeemLink - Result:', JSON.stringify(result, null, 2));
      
      if (result.status === 'SUCCESS') {
        console.log('[Superwall] Redemption successful! Navigating to success...');
        // Track purchase in Meta when redemption confirms payment
        trackPurchase(0); // Price unknown here, but event is logged
        router.push('/purchase-success');
      } else {
        console.error('[Superwall] Redemption failed:', result.status);
      }
    },
    onSubscriptionStatusChange: (status) => {
      console.log('[Superwall] Subscription status changed:', status.status);
    },
    onPaywallPresent: (info) => {
      console.log('[Superwall] Paywall presented:', info.name);
      trackPaywallView(info.name);
    },
    onPaywallDismiss: (info, result) => {
      console.log('[Superwall] Paywall dismissed:', result.type);
      
      if (result.type === 'purchased' || result.type === 'restored') {
        console.log('[Superwall] Purchase detected on dismiss!');
        trackPurchase(0);
        router.push('/purchase-success');
      }
    },
    onPaywallError: (error) => {
      console.error('[Superwall] Paywall error:', error);
    },
    onPaywallWillOpenURL: (url) => {
      console.log('[Superwall] Opening URL:', url);
      // User is leaving for Stripe checkout
      if (typeof url === 'string' && url.includes('checkout.stripe.com')) {
        trackInitiateCheckout();
      }
    },
    onPaywallWillOpenDeepLink: (url) => {
      console.log('[Superwall] Opening deep link:', url);
    },
  });

  return null;
}

function InitialPaywall() {
  const router = useRouter();
  const { registerPlacement } = usePlacement({
    onPresent: (info) => console.log('[Paywall] Presented:', info.name),
    onDismiss: (info, result) => {
      console.log('[Paywall] Dismissed:', result.type);
      if (result.type === 'purchased' || result.type === 'restored') {
        router.push('/purchase-success');
      }
    },
    onSkip: (reason) => console.log('[Paywall] Skipped:', reason),
    onError: (error) => console.error('[Paywall] Error:', error),
  });

  useEffect(() => {
    console.log('[App] Showing initial paywall...');
    registerPlacement({ placement: CAMPAIGN_TRIGGER });
  }, []);

  return null;
}

function AppContent() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SuperwallEventHandler />
      <InitialPaywall />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="purchase-success" options={{ headerShown: false }} />
        <Stack.Screen name="menu" options={{ title: 'Menu' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [attResolved, setAttResolved] = useState(false);

  useEffect(() => {
    async function requestATTAndInitMeta() {
      // Step 1: ATT prompt (must come first so Meta SDK has IDFA)
      if (Platform.OS === 'ios') {
        console.log('[ATT] Requesting tracking permission...');
        const { status } = await requestTrackingPermissionsAsync();
        console.log('[ATT] Permission status:', status);
      }

      // Step 2: Init Meta SDK (works with or without IDFA)
      initMeta();

      // Step 3: Check for deferred deep link
      // This connects: Ad Click → App Store → Install → First Open
      // Meta uses this to attribute the install to the correct ad
      const deferredUrl = await fetchDeferredDeepLink();
      if (deferredUrl) {
        console.log('[Meta] User came from ad:', deferredUrl);
        // The Meta SDK automatically uses this for attribution.
        // You could also parse the URL here to customize onboarding
        // based on which ad campaign the user came from.
      }

      setAttResolved(true);
    }

    requestATTAndInitMeta();
  }, []);

  // Wait for ATT prompt before showing anything
  // This ensures Meta SDK has IDFA (if granted) before first events fire
  if (!attResolved) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SuperwallProvider
      apiKeys={{ ios: SUPERWALL_API_KEY }}
      onConfigurationError={(error) => {
        console.error('[Superwall] Configuration failed:', error);
      }}
    >
      <SuperwallLoading>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SuperwallLoading>
      <SuperwallError>
        {(error) => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Failed to load: {error}</Text>
          </View>
        )}
      </SuperwallError>
      <SuperwallLoaded>
        <AppContent />
      </SuperwallLoaded>
    </SuperwallProvider>
  );
}
