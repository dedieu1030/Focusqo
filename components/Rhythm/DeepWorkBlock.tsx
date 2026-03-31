import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Lock } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface DeepWorkBlockProps {
  enabled: boolean;
  onToggle: () => void;
}

export function DeepWorkBlock({ enabled, onToggle }: DeepWorkBlockProps) {
  const { palette } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: palette.timerBlock }]}>
      <View style={styles.contentRow}>
        <View style={styles.labelGroup}>
          <View style={styles.titleRow}>
            <Lock size={18} color={palette.focusColor} variant="Bold" />
            <Text style={[styles.title, { color: palette.timerText }]}>Deep Work</Text>
          </View>
          <Text style={[styles.description, { color: palette.timerText }]} numberOfLines={2}>
            Complete phone lock. No notifications, no distractions.
          </Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ 
              false: palette.timerText + '20', 
              true: palette.focusColor 
            }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor={palette.timerText + '20'}
            style={Platform.OS === 'ios' ? styles.switchIOS : undefined}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingHorizontal: 22,
    borderRadius: 28,
    marginTop: 16,
    height: 108,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.5,
    lineHeight: 16,
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  switchIOS: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});
