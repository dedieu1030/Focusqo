import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useBlockedAppsStore } from '../../store/useBlockedAppsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAX_VISIBLE = 8;

interface BlockedAppsProps {
  onPress?: () => void;
}

export function BlockedApps({ onPress }: BlockedAppsProps) {
  const { palette } = useThemeStore();
  const { apps } = useBlockedAppsStore();

  const visibleApps = apps.slice(0, MAX_VISIBLE);
  const extraCount = Math.max(0, apps.length - MAX_VISIBLE);

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
        {visibleApps.map((app) => (
          <View key={app.id} style={styles.appIconWrapper}>
            {app.icon ? (
              <Image source={app.icon} style={styles.appIcon} />
            ) : (
              <View style={[styles.appIconPlaceholder, { backgroundColor: palette.focusColor + '30' }]}>
                <Text style={[styles.appIconLetter, { color: palette.focusColor }]}>
                  {app.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ))}
        
        {extraCount > 0 && (
          <View style={[styles.overflowCircle, { backgroundColor: palette.secondaryText + '20' }]}>
            <Text style={[styles.overflowText, { color: palette.timerText }]}>+{extraCount}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 28,
    marginTop: 16,
    minHeight: 108,
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
    gap: 4,
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
  appIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconLetter: {
    fontSize: 16,
    fontWeight: '800',
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
