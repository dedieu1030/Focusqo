import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useSleepStore } from '../store/useSleepStore';
import { useThemeStore } from '../store/useThemeStore';
import { useTimerStore } from '../store/useTimerStore';
import { KNOWN_ICONS } from '../store/useBlockedAppsStore';
import { Moon, Sun1, Lock, Unlock, Danger } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export function SleepScreen() {
  const { palette } = useThemeStore();
  const { timerShape } = useTimerStore();
  const sleepStore = useSleepStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = () => {
    const next = !sleepStore.isSleepModeActive;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sleepStore.toggleSleepMode(next);
  };

  const getShapeStyles = () => {
    let s: any = { borderRadius: 48 };
    if (timerShape === 'rounded') s = { borderRadius: 54 };
    if (timerShape === 'circle') s = { borderRadius: 999 }; 
    if (timerShape === 'arch') s = { borderTopLeftRadius: 999, borderTopRightRadius: 999, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 };
    return s;
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header (Mirroring Timer) */}
        <View style={styles.header}>
           <Text style={[styles.modeTitle, { color: palette.primaryText }]}>Sommeil</Text>
        </View>

        {/* Hero Barrier Block (Mirroring TimerDisplay) */}
        <View style={styles.heroContainer}>
           <View style={[styles.heroBlock, getShapeStyles(), { backgroundColor: palette.timerBlock }]}>
              <LinearGradient colors={[palette.timerBlock, palette.timerBlock + 'CC']} style={StyleSheet.absoluteFill} />
              <View style={styles.reflectiveEdge} />
              <View className="absolute top-8 w-full items-center">
                 <Moon size={24} color={palette.focusColor} variant="Bold" />
              </View>
              <Text style={[styles.timeText, { color: palette.timerText }]}>{sleepStore.sleepTime}</Text>
              <View className="absolute bottom-8 w-full items-center">
                 <Text style={{ color: palette.timerText, opacity: 0.5 }} className="text-[10px] font-black uppercase tracking-widest">Heure du Coucher</Text>
              </View>
           </View>
        </View>

        {/* Status Message (The Behavioral Mirror) */}
        <View className="items-center mb-12">
            {sleepStore.isSleepModeActive ? (
                <View className="items-center">
                  <Text style={{ color: palette.primaryText }} className="text-xl font-bold mb-2 text-center">Sleep Mode is Active</Text>
                  <Text style={{ color: palette.secondaryText }} className="text-sm opacity-60 text-center px-8">
                    Phone will lock distracting apps until morning.
                  </Text>
                </View>
            ) : (
                <View className="items-center">
                  <Text style={{ color: palette.primaryText }} className="text-xl font-bold mb-2 text-center">It's nearly bedtime</Text>
                  <Text style={{ color: palette.secondaryText }} className="text-sm opacity-60 text-center px-8">
                    Your phone will remind you to avoid the night scroll at {sleepStore.sleepTime}.
                  </Text>
                </View>
            )}
        </View>

        {/* Apps to Protect (The Mirror of behavior) */}
        <View className="px-6 mb-12">
           <Text style={{ color: palette.secondaryText }} className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Night Restricted Apps</Text>
           <View className="flex-row flex-wrap gap-4">
              {sleepStore.restrictedAppIds.map(app => (
                <View key={app} className="flex-row items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                   <Image source={KNOWN_ICONS[app]} className="w-4 h-4 opacity-70" />
                   <Text style={{ color: palette.primaryText }} className="text-xs font-bold capitalize">{app}</Text>
                </View>
              ))}
           </View>
        </View>

        {/* Actions (The Gateway) */}
        <View className="px-6 gap-4">
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleToggleMode}
              style={[styles.primaryBtn, { backgroundColor: sleepStore.isSleepModeActive ? palette.timerBlock : palette.focusColor }]}
            >
               <Text style={{ color: sleepStore.isSleepModeActive ? palette.timerText : '#FFF' }} className="font-bold text-lg">
                  {sleepStore.isSleepModeActive ? 'Cancel Sleep Mode' : 'Go to Sleep'}
               </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)}
              className="flex-row items-center justify-center gap-2 py-4"
            >
               <Danger size={20} color={palette.secondaryText} variant="Bold" />
               <Text style={{ color: palette.secondaryText }} className="font-bold opacity-60">Emergency Unlock</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 80,
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 32,
  },
  heroBlock: {
    width: '100%',
    aspectRatio: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  timeText: {
    fontSize: 92,
    fontWeight: '700',
    letterSpacing: -2,
  },
  reflectiveEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  primaryBtn: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
});
