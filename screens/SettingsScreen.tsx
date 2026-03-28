import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useTimerStore } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { PALETTES } from '../constants/Palettes';

export function SettingsScreen() {
  const timerSettings = useTimerStore();
  
  const { activePaletteId, palette, setPalette, lockBrandColors, setLockBrandColors } = useThemeStore();

  const handleDurationChange = (key: keyof typeof timerSettings, current: any, delta: number) => {
    if (typeof current !== 'number') return;
    const newValue = Math.max(1, Math.min(60, current + delta));
    timerSettings.updateSettings({ [key]: newValue });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: palette.primaryText }]}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.secondaryText }]}>Durations & Cycles</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Focus (min)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => handleDurationChange('focusDurationMin', timerSettings.focusDurationMin, -1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: palette.primaryText }]}>{timerSettings.focusDurationMin}</Text>
            <TouchableOpacity onPress={() => handleDurationChange('focusDurationMin', timerSettings.focusDurationMin, 1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Short Break (min)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => handleDurationChange('breakDurationMin', timerSettings.breakDurationMin, -1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: palette.primaryText }]}>{timerSettings.breakDurationMin}</Text>
            <TouchableOpacity onPress={() => handleDurationChange('breakDurationMin', timerSettings.breakDurationMin, 1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Long Break (min)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => handleDurationChange('longBreakDurationMin', timerSettings.longBreakDurationMin, -1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: palette.primaryText }]}>{timerSettings.longBreakDurationMin}</Text>
            <TouchableOpacity onPress={() => handleDurationChange('longBreakDurationMin', timerSettings.longBreakDurationMin, 1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Cycles before Long Break</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => handleDurationChange('cyclesBeforeLongBreak', timerSettings.cyclesBeforeLongBreak, -1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: palette.primaryText }]}>{timerSettings.cyclesBeforeLongBreak}</Text>
            <TouchableOpacity onPress={() => handleDurationChange('cyclesBeforeLongBreak', timerSettings.cyclesBeforeLongBreak, 1)}>
              <Text style={[styles.stepperBtn, { color: palette.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.secondaryText }]}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Sound Notifications</Text>
          <Switch 
            value={timerSettings.soundEnabled} 
            onValueChange={(v) => timerSettings.updateSettings({ soundEnabled: v })}
            trackColor={{ true: palette.focusColor }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Haptic Feedback</Text>
          <Switch 
            value={timerSettings.hapticEnabled} 
            onValueChange={(v) => timerSettings.updateSettings({ hapticEnabled: v })}
            trackColor={{ true: palette.focusColor }}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Keep Brand Colors</Text>
            <Text style={{ color: palette.secondaryText, fontSize: 12, opacity: 0.6 }}>Always use default Blue & Orange</Text>
          </View>
          <Switch 
            value={lockBrandColors} 
            onValueChange={setLockBrandColors}
            trackColor={{ true: palette.focusColor }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.primaryText }]}>Timer Shape</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(['rounded', 'circle', 'arch'] as const).map(shape => {
              let s: any = { borderRadius: 8 };
              if (shape === 'circle') s = { borderRadius: 16 };
              if (shape === 'arch') s = { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 };
              
              const isActive = timerSettings.timerShape === shape;
              
              return (
                <TouchableOpacity 
                  key={shape}
                  onPress={() => timerSettings.updateSettings({ timerShape: shape })}
                  style={[{
                    width: 28, height: 36, 
                    backgroundColor: isActive ? palette.focusColor : palette.accentColor + '40',
                  }, s]}
                />
              );
            })}
          </View>
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 60 }]}>
        <Text style={[styles.sectionTitle, { color: palette.secondaryText }]}>Color Palette</Text>
        <View style={styles.palettesContainer}>
          {Object.values(PALETTES).map(p => (
            <TouchableOpacity 
              key={p.id}
              style={[
                styles.paletteCard,
                { backgroundColor: p.background },
                activePaletteId === p.id && { borderColor: palette.focusColor, borderWidth: 2 }
              ]}
              onPress={() => setPalette(p.id)}
            >
              <Text style={[styles.paletteName, { color: p.primaryText }]}>{p.name}</Text>
              <View style={styles.paletteColors}>
                <View style={[styles.colorDot, { backgroundColor: p.timerBlock }]} />
                <View style={[styles.colorDot, { backgroundColor: p.focusColor }]} />
                <View style={[styles.colorDot, { backgroundColor: p.breakColor }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  palettesContainer: {
    gap: 12,
  },
  paletteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paletteName: {
    fontSize: 16,
    fontWeight: '500',
  },
  paletteColors: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
