import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, Modal, TouchableOpacity, 
  Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ShieldCheck, Minus, Plus } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeStore } from '../../store/useThemeStore';
import { useBlockedAppsStore } from '../../store/useBlockedAppsStore';
import { AddAppModal } from './AddAppModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

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
  const { apps, removeApp } = useBlockedAppsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
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
        runOnJS(handleClose)();
      } else {
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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <ShieldCheck size={22} color={palette.focusColor} strokeWidth={2} />
                <Text style={styles.headerTitle}>Restricted Apps</Text>
                <Text style={styles.headerCount}>{apps.length}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowAddModal(true)} 
                style={[styles.headerAddBtn, { backgroundColor: palette.focusColor }]}
              >
                <Plus size={20} color="#FFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>

            {/* Scrollable apps list */}
            <ScrollView 
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {apps.map((app) => (
                <View key={app.id} style={styles.appRow}>
                  <View style={styles.appRowLeft}>
                    <View style={styles.appRowIcon}>
                      {app.icon ? (
                        <Image source={app.icon} style={styles.appRowIconImg} />
                      ) : (
                        <View style={[styles.appRowIconPlaceholder, { backgroundColor: palette.focusColor + '25' }]}>
                          <Text style={[styles.appRowIconLetter, { color: palette.focusColor }]}>
                            {app.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.appRowName}>{app.name}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeApp(app.id)} 
                    style={styles.removeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Minus size={16} color="#FF6B6B" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>

      <AddAppModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
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
    height: SHEET_HEIGHT,
    paddingBottom: 36,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  headerCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  appRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  appRowIconImg: {
    width: '100%',
    height: '100%',
  },
  appRowIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  appRowIconLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  appRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EEE',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
