import React, { useEffect, useState, useCallback } from 'react';
import "./global.css";
import { View, StyleSheet, SafeAreaView, AppState, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
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

// Timing config — no spring, no oscillation
const ANIM_CONFIG = { duration: 300, easing: Easing.out(Easing.cubic) };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('timer');
  const [showRewards, setShowRewards] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [deepWorkEnabled, setDeepWorkEnabled] = useState(false);

  // ---------- Collapsible blocks logic ----------
  // Measure the real height of the blocks content via onLayout
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const hasMeasured = measuredHeight > 0;

  // progress: 0 = fully open, 1 = fully closed
  const progress = useSharedValue(0);
  // Where the drag started (to support both open→close and close→open)
  const dragStartProgress = useSharedValue(0);

  const fireHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const snapTo = useCallback((target: number) => {
    'worklet';
    progress.value = withTiming(target, ANIM_CONFIG);
    if (target > 0.5) {
      runOnJS(fireHaptic)();
    }
  }, []);

  // Pan gesture — applied ONLY to the handle bar, completely separate from ScrollView
  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragStartProgress.value = progress.value;
    })
    .onUpdate((e) => {
      // 1:1 feel but requires ~1.8x the block height to fully close
      // This makes the drag feel heavier/more intentional (iOS standard feel)
      const dragDistance = (measuredHeight || 180) * 1.8;
      const dragFraction = e.translationY / dragDistance;
      const newProgress = dragStartProgress.value + dragFraction;
      progress.value = Math.max(0, Math.min(1, newProgress));
    })
    .onEnd((e) => {
      // Snap based on position + velocity
      const velocityThreshold = 500;
      if (e.velocityY > velocityThreshold) {
        // Fast downward flick → close
        snapTo(1);
      } else if (e.velocityY < -velocityThreshold) {
        // Fast upward flick → open
        snapTo(0);
      } else {
        // Snap to nearest state
        snapTo(progress.value > 0.4 ? 1 : 0);
      }
    });

  // Animated style: opacity dissolves FIRST, then height collapses
  const blocksContainerStyle = useAnimatedStyle(() => {
    const targetHeight = measuredHeight || 180;
    return {
      // Height: stays full until progress 0.3, then collapses from 0.3→1
      height: interpolate(progress.value, [0, 0.3, 1], [targetHeight, targetHeight, 0], 'clamp'),
      // Opacity: fades out quickly from progress 0→0.35
      opacity: interpolate(progress.value, [0, 0.35], [1, 0], 'clamp'),
      overflow: 'hidden' as const,
    };
  });

  // Handle bar visual feedback
  const handleBarAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [40, 28], 'clamp'),
    opacity: interpolate(progress.value, [0, 1], [0.3, 0.7], 'clamp'),
  }));

  // ---------- App lifecycle ----------
  const { palette, loadPalette } = useThemeStore();
  const { loadState, tick, syncBackgroundTime } = useTimerStore();
  const { loadApps } = useBlockedAppsStore();
  const { loadAchievements } = useAchievementsStore();
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
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isLoaded, tick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') syncBackgroundTime();
    });
    return () => { subscription.remove(); };
  }, [syncBackgroundTime]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(page);
  };

  const handleBlocksLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && measuredHeight === 0) {
      setMeasuredHeight(height);
    }
  }, [measuredHeight]);

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style={palette.id === 'midnight' ? 'light' : 'dark'} />
        
        {/* Screen content */}
        <View style={[styles.cardContainer, { backgroundColor: palette.background }]}>
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

          {/* HANDLE — inside the screen card, visually above the dark nav */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.handleTouchArea}>
              <Animated.View style={[styles.handleBar, handleBarAnimatedStyle]} />
            </Animated.View>
          </GestureDetector>
        </View>
        
        {/* Dark bottom section */}
        <SafeAreaView style={[styles.bottomSection, { backgroundColor: '#111111' }]}>

          {/* 
            BLOCKS — wrapped in Animated.View for height + opacity animation.
            The inner View measures real content height via onLayout.
          */}
          <Animated.View style={blocksContainerStyle}>
            <View onLayout={handleBlocksLayout}>
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
              <View className="flex-row justify-center gap-2 mt-4 mb-4">
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
            </View>
          </Animated.View>

          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </SafeAreaView>
      </View>

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
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  bottomSection: {
    zIndex: 1,
  },
  handleTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  handleBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#888888',
  },
});
