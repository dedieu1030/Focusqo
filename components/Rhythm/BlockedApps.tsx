import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

export const BLOCKED_APPS = [
  { id: '1', name: 'Instagram', icon: require('../../assets/app-logos/instagram.png') },
  { id: '2', name: 'YouTube', icon: require('../../assets/app-logos/youtube.png') },
  { id: '3', name: 'TikTok', icon: require('../../assets/app-logos/tiktok.png') },
  { id: '4', name: 'Reddit', icon: require('../../assets/app-logos/reddit.png') },
  { id: '5', name: 'X', icon: require('../../assets/app-logos/x.png') },
  { id: '6', name: 'Pinterest', icon: require('../../assets/app-logos/pinterest.png') },
  { id: '7', name: 'Facebook', icon: require('../../assets/app-logos/facebook.png') },
  { id: '8', name: 'LinkedIn', icon: require('../../assets/app-logos/linkedin.png') },
];

interface BlockedAppsProps {
  onPress?: () => void;
}

export function BlockedApps({ onPress }: BlockedAppsProps) {
  const { palette } = useThemeStore();

  return (
    <TouchableOpacity 
      activeOpacity={0.85} 
      onPress={onPress}
      style={[styles.container, { backgroundColor: palette.timerBlock }]}
    >
      <View style={styles.header}>
        <ShieldAlert size={16} color={palette.focusColor} strokeWidth={2.5} />
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
          <Text style={[styles.overflowText, { color: palette.timerText }]}>+5</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerStatus, { color: palette.timerText }]}>Blocked during Focus</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingHorizontal: 12, // More air for 8 icons
    paddingVertical: 10,
    borderRadius: 28,
    marginTop: 16,
    minHeight: 108, // Standardized height for pagination
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  appsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    gap: 4, // Optimized for 8 icons at 36px
    justifyContent: 'center',
  },
  appIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  overflowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 12,
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
