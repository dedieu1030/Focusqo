import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ShieldSecurity, Add, Edit2 } from 'iconsax-react-native';
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
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShieldSecurity size={18} color={palette.focusColor} variant="Bold" />
          <Text style={[styles.headerTitle, { color: palette.timerText }]}>Restricted Apps</Text>
        </View>
        {apps.length > 0 && (
          <TouchableOpacity 
            onPress={onPress} 
            style={[styles.editBtn, { backgroundColor: palette.timerText + '10' }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit2 size={13} color={palette.timerText} opacity={0.6} variant="Linear" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.appsContainer}>
        {apps.length === 0 ? (
          <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.7}
            style={styles.emptyAddBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Add size={36} color={palette.focusColor} variant="Bold" />
          </TouchableOpacity>
        ) : (
          visibleApps.map((app) => (
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
          ))
        )}
        
        {extraCount > 0 && (
          <View style={[styles.overflowCircle, { backgroundColor: palette.secondaryText + '20' }]}>
            <Text style={[styles.overflowText, { color: palette.timerText }]}>+{extraCount}</Text>
          </View>
        )}
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
    minHeight: 108,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyAddBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
