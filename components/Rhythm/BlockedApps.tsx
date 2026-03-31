import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppsStore } from '../../store/useAppsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface BlockedAppsProps {
  onPress?: () => void;
}

export function BlockedApps({ onPress }: BlockedAppsProps) {
  const { palette } = useThemeStore();
  const { getRestrictedApps } = useAppsStore();
  
  const restrictedApps = getRestrictedApps();
  const displayApps = restrictedApps.slice(0, 8);
  const overflowCount = Math.max(0, restrictedApps.length - 8);

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
        {displayApps.map((app) => (
          <View key={app.id} style={styles.appIconWrapper}>
            <Image source={app.iconRef} style={styles.appIcon} />
          </View>
        ))}
        
        {/* Overflow Indicator */}
        {overflowCount > 0 && (
          <View style={[styles.overflowCircle, { backgroundColor: palette.secondaryText + '20' }]}>
            <Text style={[styles.overflowText, { color: palette.timerText }]}>+{overflowCount}</Text>
          </View>
        )}
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
