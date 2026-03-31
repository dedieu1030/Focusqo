import React, { useEffect, useState, useRef } from 'react';
import "./global.css";
import { View, StyleSheet, SafeAreaView, AppState, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TimerScreen } from './screens/TimerScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { TodayRhythm } from './components/Rhythm/TodayRhythm';
import { BlockedApps } from './components/Rhythm/BlockedApps';
import { BlockedAppsModal } from './components/Rhythm/BlockedAppsModal';
import { DeepWorkBlock } from './components/Rhythm/DeepWorkBlock';
import { BottomNav, ScreenName } from './components/Navigation/BottomNav';
import { useThemeStore } from './store/useThemeStore';
import { useTimerStore } from './store/useTimerStore';
import { useBlockedAppsStore } from './store/useBlockedAppsStore';
import { useAchievementsStore } from './store/useAchievementsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('timer');
  const [showRewards, setShowRewards] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [deepWorkEnabled, setDeepWorkEnabled] = useState(false);
  const { palette, loadPalette } = useThemeStore();
  const { loadState, tick, syncBackgroundTime, history, labels } = useTimerStore();
  const { loadApps } = useBlockedAppsStore();
  const { loadAchievements, checkAchievements } = useAchievementsStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadPalette();
      await loadState();
      await loadApps();
      await loadAchievements();
      setIsLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, tick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncBackgroundTime();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncBackgroundTime]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(page);
  };

  if (!isLoaded) return null; // Or a loading spinner

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style={palette.id === 'midnight' ? 'light' : 'dark'} />
        
        {/* The main white/light card that stacks above */}
        <View style={styles.cardContainer}>
          {showRewards ? (
            <RewardsScreen onBack={() => setShowRewards(false)} />
          ) : (
            <>
              {currentScreen === 'timer' && <TimerScreen />}
              {currentScreen === 'insights' && (
                <InsightsScreen onOpenRewards={() => setShowRewards(true)} />
              )}
              {currentScreen === 'settings' && <SettingsScreen />}
            </>
          )}
        </View>
        
        {/* The dark bottom section that stays fixed */}
        <SafeAreaView style={[styles.bottomSection, { backgroundColor: '#111111' }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
          >
            <View style={{ width: SCREEN_WIDTH }}>
              <TodayRhythm />
            </View>
            <View style={{ width: SCREEN_WIDTH }}>
              <BlockedApps onPress={() => setShowAppsModal(true)} />
            </View>
            <View style={{ width: SCREEN_WIDTH }}>
              <DeepWorkBlock enabled={deepWorkEnabled} onToggle={() => setDeepWorkEnabled(!deepWorkEnabled)} />
            </View>
          </ScrollView>
          
          {/* Pagination Dots */}
          <View className="flex-row justify-center gap-2 mt-6 mb-6">
             {[0, 1, 2].map((i) => (
               <View 
                 key={i}
                 className="h-1.5 rounded-full" 
                 style={{ 
                   width: activePage === i ? 24 : 6,
                   backgroundColor: 'white', 
                   opacity: activePage === i ? 0.9 : 0.2 
                 }} 
               />
             ))}
          </View>

          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </SafeAreaView>
      </View>

      {/* Blocked Apps Expanded Modal — rendered at root level */}
      <BlockedAppsModal visible={showAppsModal} onClose={() => setShowAppsModal(false)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111', 
  },
  cardContainer: {
    flex: 1,
    zIndex: 10,
  },
  bottomSection: {
    zIndex: 1,
  },
  spacer: {
    height: 16,
  }
});
