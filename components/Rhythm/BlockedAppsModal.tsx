import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ShieldCheck, X, ChevronDown } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeStore } from '../../store/useThemeStore';
import { BLOCKED_APPS } from './BlockedApps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BlockedAppsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SPRING_CONFIG = {
  damping: 28,
  stiffness: 220,
  mass: 1,
  overshootClamping: false,
};

export function BlockedAppsModal({ visible, onClose }: BlockedAppsModalProps) {
  const { palette } = useThemeStore();
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, { ...SPRING_CONFIG, damping: 40 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedSheet = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdrop = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = () => {
    translateY.value = withSpring(SCREEN_HEIGHT, { ...SPRING_CONFIG, damping: 40 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
    // Delay the actual close to let the animation play
    setTimeout(onClose, 300);
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 500) {
        // swipe down hard enough or far enough -> dismiss
        runOnJS(handleClose)();
      } else {
        // bounce back up
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdrop]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, animatedSheet]}>
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ShieldCheck size={24} color={palette.focusColor} strokeWidth={2} />
            <Text style={styles.headerTitle}>Restricted Apps</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          These apps are blocked during your Focus sessions to help you stay productive.
        </Text>

        {/* Apps Grid */}
        <View style={styles.grid}>
          {BLOCKED_APPS.map((app) => (
            <View key={app.id} style={styles.gridItem}>
              <View style={styles.gridIcon}>
                <Image source={app.icon} style={styles.gridIconImg} />
              </View>
              <Text style={styles.gridLabel} numberOfLines={1}>{app.name}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Blocked</Text>
            <Text style={[styles.statValue, { color: palette.focusColor }]}>{BLOCKED_APPS.length} apps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    minHeight: SCREEN_HEIGHT * 0.55,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginBottom: 32,
  },
  gridItem: {
    alignItems: 'center',
    width: 64,
  },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 6,
  },
  gridIconImg: {
    width: '100%',
    height: '100%',
  },
  gridLabel: {
    fontSize: 11,
    color: '#BBB',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ADE80',
  },
});
