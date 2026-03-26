import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const BLOCKED_APPS = [
  { id: '1', name: 'Instagram', icon: require('../../assets/app-logos/instagram.png') },
  { id: '2', name: 'YouTube', icon: require('../../assets/app-logos/youtube.png') },
  { id: '3', name: 'TikTok', icon: require('../../assets/app-logos/tiktok.png') },
  { id: '4', name: 'Reddit', icon: require('../../assets/app-logos/reddit.png') },
];

export function BlockedApps() {
  const { palette } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <View style={styles.header}>
        <ShieldAlert size={16} color="#3B82F6" strokeWidth={2.5} />
        <Text style={[styles.headerTitle, { color: palette.timerText }]}>Restricted Apps</Text>
      </View>

      <View style={styles.appsContainer}>
        {BLOCKED_APPS.map((app) => (
          <View key={app.id} style={styles.appIconWrapper}>
            <Image source={app.icon} style={styles.appIcon} />
          </View>
        ))}
        
        {/* Overflow Indicator */}
        <View style={[styles.overflowCircle, { backgroundColor: palette.secondaryText + '20' }]}>
          <Text style={[styles.overflowText, { color: palette.timerText }]}>+12</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerStatus, { color: palette.timerText }]}>Blocked durante Focus</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  appsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    marginBottom: 8,
    gap: 12,
    justifyContent: 'center',
  },
  appIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  overflowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
  },
  footerStatus: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
