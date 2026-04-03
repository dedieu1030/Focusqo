import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, AppState } from 'react-native';
import { useSleepStore } from '../store/useSleepStore';
import { useThemeStore } from '../store/useThemeStore';
import { useBlockedAppsStore, KNOWN_ICONS } from '../store/useBlockedAppsStore';
import { Moon, Sun1, Timer, VolumeHigh, Activity, CloseCircle, ArrowRight2, TickCircle, Mirror, Heart, AudioSquare, Note } from 'iconsax-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SleepScreen() {
  const { palette } = useThemeStore();
  const sleepStore = useSleepStore();
  const { apps } = useBlockedAppsStore();
  
  const [step, setStep] = useState(0); 
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Dynamic time check
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Temporal state for onboarding
  const [tempSleep, setTempSleep] = useState(sleepStore.sleepTime);
  const [tempWake, setTempWake] = useState(sleepStore.wakeTime);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const [sH, sM] = sleepStore.sleepTime.split(':').map(Number);
  const [wH, wM] = sleepStore.wakeTime.split(':').map(Number);
  
  const sleepByMins = sH * 60 + sM;
  let wakeByMins = wH * 60 + wM;
  if (wakeByMins < sleepByMins) wakeByMins += 24 * 60;

  const isNightTime = currentMins >= sleepByMins && currentMins < wakeByMins;
  const isMorningTime = currentMins >= wakeByMins && currentMins < (wakeByMins + 180);

  // ── ONBOARDING ────────────────────────────────────────────────────────────

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else {
      sleepStore.setSleepTime(tempSleep);
      sleepStore.setWakeTime(tempWake);
      sleepStore.setScrollApps(selectedApps);
      sleepStore.completeOnboarding();
    }
  };

  const renderOnboarding = () => {
    return (
      <View className="flex-1 px-8 justify-center">
        <Animated.View entering={FadeIn.duration(600)} key={step}>
          {step === 0 && (
            <View className="items-center">
              <Moon size={64} color={palette.focusColor} variant="Bold" />
              <Text style={{ color: palette.primaryText }} className="text-3xl font-bold mt-6 text-center">
                Quand veux-tu dormir ?
              </Text>
              <Text style={{ color: palette.secondaryText }} className="text-center mt-2 px-4">
                Nous calculerons l'heure idéale pour couper les écrans.
              </Text>
              
              <View className="flex-row items-center mt-12 bg-black/20 p-6 rounded-3xl">
                <TimeSpinner value={tempSleep} onChange={setTempSleep} palette={palette} />
              </View>
            </View>
          )}

          {step === 1 && (
            <View className="items-center">
              <Sun1 size={64} color={palette.accentColor} variant="Bold" />
              <Text style={{ color: palette.primaryText }} className="text-3xl font-bold mt-6 text-center">
                Heure de réveil ?
              </Text>
              <Text style={{ color: palette.secondaryText }} className="text-center mt-2 px-4">
                Pour une énergie optimale demain.
              </Text>
              
              <View className="flex-row items-center mt-12 bg-black/20 p-6 rounded-3xl">
                <TimeSpinner value={tempWake} onChange={setTempWake} palette={palette} />
              </View>
            </View>
          )}

          {step === 2 && (
            <View className="items-center h-[450px]">
              <Activity size={64} color={palette.timerText} variant="Bold" />
              <Text style={{ color: palette.primaryText }} className="text-2xl font-bold mt-6 text-center">
                Quelles apps te font scroller ?
              </Text>
              <Text style={{ color: palette.secondaryText }} className="text-center mt-2 mb-6">
                On t'aidera à les éviter juste avant de dormir.
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false} className="w-full">
                <View className="flex-row flex-wrap justify-center gap-3">
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
                        style={{ backgroundColor: isSelected ? palette.focusColor : 'rgba(255,255,255,0.05)' }}
                        className="p-4 rounded-2xl items-center w-[100px]"
                      >
                        <Image source={KNOWN_ICONS[appName]} className="w-10 h-10 opacity-80" />
                        <Text style={{ color: isSelected ? 'white' : palette.secondaryText }} className="text-[10px] mt-2 capitalize font-bold">
                          {appName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleNext}
            style={{ backgroundColor: palette.primaryText }}
            className="mt-12 py-4 rounded-2xl flex-row justify-center items-center"
          >
            <Text style={{ color: palette.background }} className="font-bold text-lg mr-2">
              {step === 2 ? "C'est parti" : "Continuer"}
            </Text>
            <ArrowRight2 size={20} color={palette.background} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // ── DASHBOARD ─────────────────────────────────────────────────────────────

  const renderDashboard = () => {
    const sleepDur = sleepStore.sleepDuration;
    
    if (isNightTime) {
      return (
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#050505' }}>
          <Animated.View entering={FadeIn.duration(1000)} className="items-center w-full">
            <View style={{ backgroundColor: '#111' }} className="p-12 rounded-full mb-12 border border-white/5 shadow-2xl">
               <Moon size={100} color="#666" variant="Bold" />
            </View>
            <Text className="text-white text-3xl font-bold text-center">Mode Nuit Actif</Text>
            <Text className="text-gray-500 text-center mt-4 mb-12 leading-6">
              Ton téléphone se calme. Repose-toi sérieusement.
            </Text>
            
            <View className="flex-row flex-wrap justify-center gap-4">
               <AudioButton icon={<Heart size={24} color="#FFF" />} title="Prière" />
               <AudioButton icon={<Activity size={24} color="#FFF" />} title="Respiration" />
               <AudioButton icon={<Mirror size={24} color="#FFF" />} title="Méditation" />
               <AudioButton icon={<AudioSquare size={24} color="#FFF" />} title="Bruit blanc" />
            </View>
            
            <TouchableOpacity onPress={() => sleepStore.resetSleep()} className="mt-20">
               <Text className="text-gray-600 text-xs italic underline">Réinitialiser les réglages</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    if (isMorningTime) {
      return (
        <View className="flex-1 px-8 py-20 justify-center">
           <Animated.View entering={SlideInDown.springify()} className="items-center">
              <View style={{ backgroundColor: palette.accentColor + '20' }} className="p-8 rounded-full mb-8">
                 <Sun1 size={64} color={palette.accentColor} variant="Bold" />
              </View>
              <Text style={{ color: palette.primaryText }} className="text-4xl font-black text-center">Bonjour !</Text>
              <Text style={{ color: palette.secondaryText }} className="text-center mt-4 text-lg">
                Tu as dormi <Text style={{ color: palette.primaryText }} className="font-bold">{Math.floor(sleepDur)}h {Math.round((sleepDur % 1) * 60)}m</Text>.
              </Text>
              
              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} className="mt-8 p-6 rounded-3xl w-full border border-white/5">
                 <Text style={{ color: palette.secondaryText }} className="font-bold uppercase text-[10px] mb-4">Conseils du matin</Text>
                 <View className="gap-4">
                    <Text style={{ color: palette.primaryText }} className="font-medium">• 3 tâches faciles aujourd'hui</Text>
                    <Text style={{ color: palette.primaryText }} className="font-medium">• Un grand verre d'eau maintenant</Text>
                    <Text style={{ color: palette.primaryText }} className="font-medium">• Rappel : Ton futur toi est fier de toi.</Text>
                 </View>
                 <View className="mt-6 pt-6 border-t border-white/5 items-center">
                    <Text style={{ color: palette.accentColor }} className="font-bold italic text-center">Ton énergie aujourd'hui sera moyenne.</Text>
                 </View>
              </View>
           </Animated.View>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 100 }}>
        <View className="items-center mb-10">
           <View style={{ backgroundColor: palette.timerBlock }} className="p-8 rounded-full mb-6">
              <Moon size={48} color={palette.focusColor} variant="Bold" />
           </View>
           <Text style={{ color: palette.primaryText }} className="text-3xl font-bold">Sleepqo</Text>
           <Text style={{ color: palette.secondaryText }} className="mt-1">Ta nuit idéale est prête</Text>
        </View>

        <View className="flex-row gap-4 mb-8">
           <View style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} className="flex-1 p-5 rounded-3xl border border-white/5">
              <Text style={{ color: palette.secondaryText }} className="text-xs font-bold uppercase mb-2">Sommeil</Text>
              <Text style={{ color: palette.primaryText }} className="text-2xl font-bold">{Math.floor(sleepDur)}h {Math.round((sleepDur % 1) * 60)}m</Text>
           </View>
           <View style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} className="flex-1 p-5 rounded-3xl border border-white/5">
              <Text style={{ color: palette.secondaryText }} className="text-xs font-bold uppercase mb-2">Coupure</Text>
              <Text style={{ color: palette.primaryText }} className="text-2xl font-bold">{sleepStore.screenOffTime}</Text>
           </View>
        </View>

        <Text style={{ color: palette.secondaryText }} className="font-bold uppercase text-[10px] mb-4 ml-2">Préparation (Phase 1)</Text>
        <View className="gap-3">
           <ActionItem 
              icon={<Timer size={24} color={palette.timerText} />}
              title="Lancer minuteur détente"
              desc="20 min de calme avant le lit"
              palette={palette}
           />
           <ActionItem 
              icon={<VolumeHigh size={24} color={palette.accentColor} />}
              title="Écouter un audio calme"
              desc="Pluie, méditation ou respiration"
              palette={palette}
           />
           <ActionItem 
              icon={<CloseCircle size={24} color={palette.focusColor} />}
              title="Fermer les apps de scroll"
              desc="Ton futur toi te remercie"
              palette={palette}
           />
        </View>
        
        <TouchableOpacity 
          onPress={() => sleepStore.resetSleep()}
          className="mt-12 items-center"
        >
          <Text style={{ color: palette.secondaryText }} className="text-xs opacity-50 underline">Modifier les réglages</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {!sleepStore.isOnboarded ? renderOnboarding() : renderDashboard()}
    </View>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────

function TimeSpinner({ value, onChange, palette }: { value: string, onChange: (v: string) => void, palette: any }) {
  const [h, m] = value.split(':');
  
  const adjust = (type: 'h' | 'm', delta: number) => {
    Haptics.selectionAsync();
    let nh = parseInt(h);
    let nm = parseInt(m);
    if (type === 'h') nh = (nh + delta + 24) % 24;
    else nm = (nm + delta + 60) % 60;
    onChange(`${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`);
  };

  return (
    <View className="flex-row items-center gap-6">
      <View className="items-center">
        <TouchableOpacity onPress={() => adjust('h', 1)} className="p-2"><Text style={{ color: palette.primaryText, opacity: 0.3 }} className="text-xl">▲</Text></TouchableOpacity>
        <Text style={{ color: palette.primaryText }} className="text-5xl font-black">{h}</Text>
        <TouchableOpacity onPress={() => adjust('h', -1)} className="p-2"><Text style={{ color: palette.primaryText, opacity: 0.3 }} className="text-xl">▼</Text></TouchableOpacity>
      </View>
      <Text style={{ color: palette.primaryText }} className="text-4xl font-light">:</Text>
      <View className="items-center">
        <TouchableOpacity onPress={() => adjust('m', 5)} className="p-2"><Text style={{ color: palette.primaryText, opacity: 0.3 }} className="text-xl">▲</Text></TouchableOpacity>
        <Text style={{ color: palette.primaryText }} className="text-5xl font-black">{m}</Text>
        <TouchableOpacity onPress={() => adjust('m', -5)} className="p-2"><Text style={{ color: palette.primaryText, opacity: 0.3 }} className="text-xl">▼</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function ActionItem({ icon, title, desc, palette }: { icon: any, title: string, desc: string, palette: any }) {
  return (
    <TouchableOpacity 
      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} 
      className="p-4 rounded-3xl border border-white/5 flex-row items-center gap-4"
    >
      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} className="p-3 rounded-2xl">
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ color: palette.primaryText }} className="font-bold text-base">{title}</Text>
        <Text style={{ color: palette.secondaryText }} className="text-sm">{desc}</Text>
      </View>
      <ArrowRight2 size={18} color={palette.secondaryText} />
    </TouchableOpacity>
  );
}

function AudioButton({ icon, title }: { icon: any, title: string }) {
  const [active, setActive] = useState(false);
  
  return (
    <TouchableOpacity 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActive(!active);
      }}
      style={{ 
        backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
        width: (SCREEN_WIDTH - 80) / 2
      }} 
      className="p-5 rounded-3xl items-center gap-3 border border-white/5"
    >
      {icon}
      <Text className="text-white font-bold text-xs">{title}</Text>
      {active && <TickCircle size={14} color="#FFF" variant="Bold" />}
    </TouchableOpacity>
  );
}
