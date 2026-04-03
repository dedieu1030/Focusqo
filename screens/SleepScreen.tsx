import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useSleepStore } from '../store/useSleepStore';
import { useThemeStore } from '../store/useThemeStore';
import { useBlockedAppsStore, KNOWN_ICONS } from '../store/useBlockedAppsStore';
import { Moon, Sun1, Timer, VolumeHigh, Activity, ArrowRight2, TickCircle, Mirror, Heart, AudioSquare, Note } from 'iconsax-react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SleepScreen() {
  const { palette } = useThemeStore();
  const sleepStore = useSleepStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const [tempSleep, setTempSleep] = useState(sleepStore.sleepTime);
  const [tempWake, setTempWake] = useState(sleepStore.wakeTime);
  const [selectedApps, setSelectedApps] = useState<string[]>(sleepStore.scrollApps);

  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const [sH, sM] = sleepStore.sleepTime.split(':').map(Number);
  const [wH, wM] = sleepStore.wakeTime.split(':').map(Number);
  
  const sleepByMins = sH * 60 + sM;
  let wakeByMins = wH * 60 + wM;
  if (wakeByMins < sleepByMins) wakeByMins += 24 * 60;

  const isNightTime = currentMins >= sleepByMins && currentMins < wakeByMins;
  const isMorningTime = currentMins >= wakeByMins && currentMins < (wakeByMins + 180);

  const handleSaveSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sleepStore.setSleepTime(tempSleep);
    sleepStore.setWakeTime(tempWake);
    sleepStore.setScrollApps(selectedApps);
    if (!sleepStore.isOnboarded) sleepStore.completeOnboarding();
  };

  // ── PREMIUM SETUP (IF NOT ONBOARDED) ──────────────────────────────────

  const renderSetup = () => (
    <LinearGradient colors={['#0A0A0A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.premiumTitle}>Sleepqo</Text>
          <Text style={styles.premiumSubtitle}>Ta routine de repos, redéfinie.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
           <Text style={styles.cardHeader}>Ton Sommeil</Text>
           <View className="flex-row items-center justify-between mb-6">
              <View>
                 <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Coucher</Text>
                 <TimePicker value={tempSleep} onChange={setTempSleep} palette={palette} />
              </View>
              <ArrowRight2 size={16} color="rgba(255,255,255,0.2)" />
              <View>
                 <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Réveil</Text>
                 <TimePicker value={tempWake} onChange={setTempWake} palette={palette} />
              </View>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)} style={styles.glassCard}>
           <Text style={styles.cardHeader}>Apps à Limiter</Text>
           <Text className="text-gray-400 text-xs mb-4">On t'aidera à les éviter 45 min avant de dormir.</Text>
           <View className="flex-row flex-wrap gap-3">
              {Object.keys(KNOWN_ICONS).map(appName => {
                const isSelected = selectedApps.includes(appName);
                return (
                  <TouchableOpacity 
                    key={appName}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (isSelected) setSelectedApps(selectedApps.filter(a => a !== appName));
                        else setSelectedApps([...selectedApps, appName]);
                    }}
                    style={{ 
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
                      borderWidth: 1
                    }}
                    className="px-4 py-2 rounded-xl flex-row items-center gap-2"
                  >
                    <Image source={KNOWN_ICONS[appName]} className="w-5 h-5 opacity-80" />
                    <Text className="text-white text-xs font-semibold capitalize">{appName}</Text>
                  </TouchableOpacity>
                );
              })}
           </View>
        </Animated.View>

        <TouchableOpacity 
          onPress={handleSaveSettings}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={[palette.focusColor || '#4A90E2', palette.timerBlock || '#357ABD']} 
            className="mt-8 py-5 rounded-[28px] items-center shadow-xl"
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text className="text-white font-bold text-lg">Activer Sleepqo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );

  // ── PREMIUM DASHBOARD (IF ONBOARDED) ──────────────────────────────────

  const renderDashboard = () => {
    const sleepDur = sleepStore.sleepDuration;
    
    return (
      <View style={styles.container}>
        <LinearGradient 
           colors={isNightTime ? ['#050505', '#111'] : ['#0A0A0A', '#1A1A2E']} 
           style={StyleSheet.absoluteFill} 
        />
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-8">
             <View>
                <Text style={styles.premiumTitle}>Sommeil</Text>
                <Text style={styles.premiumSubtitle}>
                  {isNightTime ? "Le calme t'appartient." : "Prépare ta nuit idéale."}
                </Text>
             </View>
             <TouchableOpacity onPress={() => sleepStore.resetSleep()} className="p-2 bg-white/5 rounded-full">
                <Activity size={20} color="rgba(255,255,255,0.4)" />
             </TouchableOpacity>
          </View>

          {isMorningTime && (
            <Animated.View entering={FadeInDown} style={styles.morningCard}>
               <LinearGradient colors={['rgba(255,165,0,0.15)', 'transparent']} style={StyleSheet.absoluteFill} className="rounded-[32px]" />
               <View className="flex-row items-center gap-4">
                  <Sun1 size={32} color="#FFA500" variant="Bold" />
                  <View>
                     <Text className="text-white text-xl font-bold">Bien dormi ?</Text>
                     <Text className="text-gray-400 text-sm">Tu as récupéré <Text className="text-white font-bold">{Math.floor(sleepDur)}h {Math.round((sleepDur % 1) * 60)}m</Text></Text>
                  </View>
               </View>
            </Animated.View>
          )}

          <View className="flex-row gap-4 mb-8">
              <GlassWidget 
                label="Repos Idéal" 
                value={`${Math.floor(sleepDur)}h`} 
                icon={<Moon size={20} color="#4A90E2" variant="Bold" />} 
              />
              <GlassWidget 
                label="Écran Off" 
                value={sleepStore.screenOffTime} 
                icon={<Timer size={20} color="#FFA500" variant="Bold" />} 
              />
          </View>

          <View style={styles.glassCard}>
             <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Routine de Détente</Text>
             <RoutineItem 
               icon={<Heart size={24} color="#FF6B6B" variant="Bold" />} 
               title="Prière & Respiration" 
               desc="Calme l'esprit en 5 minutes" 
             />
             <RoutineItem 
               icon={<VolumeHigh size={24} color="#4A90E2" variant="Bold" />} 
               title="Ambiances Sonores" 
               desc="Bruit blanc, pluie, océan" 
             />
             <RoutineItem 
               icon={<Mirror size={24} color="#9B51E0" variant="Bold" />} 
               title="Méditation Guidée" 
               desc="Se préparer au lâcher-prise" 
             />
          </View>

          {isNightTime && (
             <Animated.View entering={FadeIn.duration(1000)} className="mt-12 items-center">
                <View className="w-16 h-1 bg-white/10 rounded-full mb-4" />
                <Text className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">Mode Nuit Actif</Text>
             </Animated.View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {!sleepStore.isOnboarded ? renderSetup() : renderDashboard()}
    </View>
  );
}

// ── PREMIUM UI COMPONENTS ───────────────────────────────────────

function GlassWidget({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <View style={styles.glassWidget}>
      <View className="flex-row items-center gap-2 mb-2">
         {icon}
         <Text className="text-gray-500 text-[9px] uppercase font-black tracking-widest">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
    </View>
  );
}

function TimePicker({ value, onChange, palette }: { value: string, onChange: (v: string) => void, palette: any }) {
  const [h, m] = value.split(':');
  const adjust = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let nh = (parseInt(h) + delta + 24) % 24;
    onChange(`${nh.toString().padStart(2, '0')}:${m}`);
  };

  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity onPress={() => adjust(-1)} className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
         <Text className="text-white opacity-40">-</Text>
      </TouchableOpacity>
      <Text className="text-white text-3xl font-black">{value}</Text>
      <TouchableOpacity onPress={() => adjust(1)} className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
         <Text className="text-white opacity-40">+</Text>
      </TouchableOpacity>
    </View>
  );
}

function RoutineItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <TouchableOpacity activeOpacity={0.7} className="flex-row items-center mb-6 last:mb-0">
       <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4 border border-white/5">
          {icon}
       </View>
       <View className="flex-1">
          <Text className="text-white font-bold text-base">{title}</Text>
          <Text className="text-gray-500 text-[11px]">{desc}</Text>
       </View>
       <ArrowRight2 size={16} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 120,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
    letterSpacing: -0.2,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  glassWidget: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },
  morningCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.2)',
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,165,0,0.05)',
  },
});
