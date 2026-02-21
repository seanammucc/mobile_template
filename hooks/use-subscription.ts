import { useUser } from 'expo-superwall';

/**
 * Hook to manage subscription status using expo-superwall
 */
export const useSubscription = () => {
  const { subscriptionStatus, getEntitlements } = useUser();

  const isSubscribed = subscriptionStatus?.status === 'ACTIVE';
  const isLoading = subscriptionStatus?.status === 'UNKNOWN';

  const checkEntitlement = async (entitlementId: string): Promise<boolean> => {
    try {
      const entitlements = await getEntitlements();
      return entitlements.active.some((e: { id: string }) => e.id === entitlementId);
    } catch {
      return false;
    }
  };

  return {
    isLoading,
    isSubscribed,
    subscriptionStatus,
    checkEntitlement,
  };
};
