import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ShieldCheck, X, ChevronDown, Plus } from 'lucide-react-native';
import { Gesture, GestureDetector, ScrollView as GScrollView } from 'react-native-gesture-handler';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppsStore, APP_CATALOG, AppData } from '../../store/useAppsStore';

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
  const { restrictedAppIds, addApp, removeApp, getRestrictedApps } = useAppsStore();
  const restrictedApps = getRestrictedApps();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [showCatalog, setShowCatalog] = React.useState(false);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 300 });
      setIsEditing(false); // Reset editing mode when opening
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, { ...SPRING_CONFIG, damping: 40 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      setShowCatalog(false);
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
      // Don't drag down if we are looking at the catalog
      if (showCatalog) return; 
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (showCatalog) return; 
      if (event.translationY > 150 || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const availableApps = APP_CATALOG.filter(a => !restrictedAppIds.includes(a.id));

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
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
            <Text style={[styles.editBtnText, { color: isEditing ? palette.breakColor : palette.focusColor }]}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          These apps are blocked during your Focus sessions to help you stay productive.
        </Text>

        {/* Apps Grid */}
        <View style={styles.grid}>
          {restrictedApps.map((app) => (
            <View key={app.id} style={styles.gridItem}>
              <View style={[styles.gridIcon, isEditing && styles.gridIconEditing]}>
                <Image source={app.iconRef} style={styles.gridIconImg} />
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.deleteBadge} 
                    onPress={() => removeApp(app.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={styles.deleteBadgeInner} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.gridLabel} numberOfLines={1}>{app.name}</Text>
            </View>
          ))}
          
          {/* Add App Button (only visible in edit mode) */}
          {isEditing && availableApps.length > 0 && (
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => setShowCatalog(true)}
            >
              <View style={[styles.gridIcon, styles.addBtn]}>
                <Plus size={24} color="#888" strokeWidth={3} />
              </View>
              <Text style={styles.gridLabel}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Blocked</Text>
            <Text style={[styles.statValue, { color: palette.focusColor }]}>{restrictedApps.length} apps</Text>
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

    {showCatalog && (
        <View style={styles.catalogOverlay}>
          <View style={styles.catalogHeader}>
            <Text style={styles.catalogTitle}>App Catalog</Text>
            <TouchableOpacity onPress={() => setShowCatalog(false)} style={styles.catalogClose}>
              <Text style={[styles.catalogCloseText, { color: palette.focusColor }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <GScrollView style={styles.catalogList}>
            {availableApps.map(app => (
              <View key={app.id} style={styles.catalogItem}>
                <Image source={app.iconRef} style={styles.catalogItemIcon} />
                <Text style={styles.catalogItemName}>{app.name}</Text>
                <TouchableOpacity 
                  style={[styles.catalogAddBtn, { backgroundColor: palette.focusColor + '20' }]} 
                  onPress={() => addApp(app.id)}
                >
                  <Plus size={16} color={palette.focusColor} strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </GScrollView>
        </View>
      )}
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
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  editBtnText: {
    fontWeight: '700',
    fontSize: 14,
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
  gridIconEditing: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  deleteBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FA233B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  deleteBadgeInner: {
    width: 8,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  addBtn: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    zIndex: 100,
    paddingTop: 60,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  catalogTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  catalogClose: {
    padding: 8,
  },
  catalogCloseText: {
    fontWeight: '700',
    fontSize: 16,
  },
  catalogList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  catalogItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 16,
  },
  catalogItemName: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  catalogAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
