import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SUPERWALL_API_KEY, CAMPAIGN_TRIGGER } from '@/lib/superwall';
import {
  SuperwallProvider,
  SuperwallLoading,
  SuperwallLoaded,
  SuperwallError,
  usePlacement,
  useSuperwallEvents,
  useUser,
} from 'expo-superwall';
import { ActivityIndicator, View, Text } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

function SuperwallEventHandler() {
  const router = useRouter();
  const { subscriptionStatus } = useUser();

  useSuperwallEvents({
    willRedeemLink: () => {
      console.log('[Superwall] willRedeemLink - Redemption starting...');
    },
    didRedeemLink: (result) => {
      console.log('[Superwall] didRedeemLink - Result:', JSON.stringify(result, null, 2));
      
      if (result.status === 'SUCCESS') {
        console.log('[Superwall] Redemption successful! Navigating to success...');
        router.push('/purchase-success');
      } else {
        console.error('[Superwall] Redemption failed:', result.status);
      }
    },
    onSubscriptionStatusChange: (status) => {
      console.log('[Superwall] Subscription status changed:', status.status);
      
      if (status.status === 'ACTIVE') {
        console.log('[Superwall] User is now ACTIVE!');
      }
    },
    onPaywallPresent: (info) => {
      console.log('[Superwall] Paywall presented:', info.name);
    },
    onPaywallDismiss: (info, result) => {
      console.log('[Superwall] Paywall dismissed:', result.type);
      
      if (result.type === 'purchased' || result.type === 'restored') {
        console.log('[Superwall] Purchase detected on dismiss!');
        router.push('/purchase-success');
      }
    },
    onPaywallError: (error) => {
      console.error('[Superwall] Paywall error:', error);
    },
    onPaywallWillOpenURL: (url) => {
      console.log('[Superwall] Opening URL:', url);
    },
    onPaywallWillOpenDeepLink: (url) => {
      console.log('[Superwall] Opening deep link:', url);
    },
  });

  return null;
}

function InitialPaywall() {
  const router = useRouter();
  const { registerPlacement, state } = usePlacement({
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
  const { subscriptionStatus } = useUser();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SuperwallEventHandler />
      <InitialPaywall />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="purchase-success" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
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
