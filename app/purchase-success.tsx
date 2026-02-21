import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSubscription } from '@/hooks/use-subscription';

export default function PurchaseSuccessScreen() {
  const router = useRouter();
  const { isSubscribed, isLoading } = useSubscription();

  useEffect(() => {
    // Wait a moment to show the success message, then redirect
    const timer = setTimeout(() => {
      if (isSubscribed) {
        // Option 1: Go to main app
        router.replace('/(tabs)');
        
        // Option 2: Go to premium features
        // router.replace('/premium-features');
      }
    }, 3000); // Show success for 3 seconds

    return () => clearTimeout(timer);
  }, [isSubscribed, router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.text}>Verifying your purchase...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      
      <ThemedText type="title" style={styles.title}>
        Welcome to Premium!
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        Your subscription is now active. Enjoy all premium features!
      </ThemedText>

      <View style={styles.featuresList}>
        <ThemedText style={styles.feature}>✓ Unlimited access</ThemedText>
        <ThemedText style={styles.feature}>✓ Premium features unlocked</ThemedText>
        <ThemedText style={styles.feature}>✓ Priority support</ThemedText>
      </View>

      <ThemedText style={styles.redirectText}>
        Redirecting you to the app...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  featuresList: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
  },
  redirectText: {
    fontSize: 14,
    opacity: 0.6,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
