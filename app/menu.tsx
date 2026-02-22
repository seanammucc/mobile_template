import { StyleSheet, TouchableOpacity, View, Text, Linking } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const MANAGE_SUBSCRIPTION_URL = 'https://template-hammerapps.superwall.app/manage';
const TOS_URL = 'https://template-hammerapps.superwall.app/terms';
const PRIVACY_URL = 'https://template-hammerapps.superwall.app/privacy';

export default function MenuScreen() {
  const handleLink = async (url: string) => {
    await Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => handleLink(MANAGE_SUBSCRIPTION_URL)}
      >
        <IconSymbol size={24} name="creditcard" color="#007AFF" />
        <ThemedText style={styles.menuText}>Manage Subscription</ThemedText>
        <IconSymbol size={20} name="chevron.right" color="#8E8E93" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => handleLink(TOS_URL)}
      >
        <IconSymbol size={24} name="doc.text" color="#007AFF" />
        <ThemedText style={styles.menuText}>Terms of Service</ThemedText>
        <IconSymbol size={20} name="chevron.right" color="#8E8E93" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => handleLink(PRIVACY_URL)}
      >
        <IconSymbol size={24} name="hand.raised" color="#007AFF" />
        <ThemedText style={styles.menuText}>Privacy Policy</ThemedText>
        <IconSymbol size={20} name="chevron.right" color="#8E8E93" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 52,
  },
});
