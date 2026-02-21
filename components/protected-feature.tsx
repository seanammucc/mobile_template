import React from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useSubscription } from '@/hooks/use-subscription';
import { usePlacement } from 'expo-superwall';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  placement?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that protects its children behind a paywall
 */
export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  children,
  placement = 'premium_feature',
  fallback,
}) => {
  const { isLoading, isSubscribed } = useSubscription();
  const { registerPlacement } = usePlacement();

  const handleUnlock = async () => {
    await registerPlacement({ placement });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isSubscribed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Feature</Text>
      <Text style={styles.description}>
        This feature requires a subscription. Upgrade to unlock!
      </Text>
      <Button title="Unlock Now" onPress={handleUnlock} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
