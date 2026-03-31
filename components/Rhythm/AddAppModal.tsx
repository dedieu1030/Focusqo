import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  TextInput, FlatList, KeyboardAvoidingView, Platform, Image, Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SearchNormal1, Add, TickCircle } from 'iconsax-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useBlockedAppsStore, KNOWN_ICONS } from '../../store/useBlockedAppsStore';
import { BRAND_COLORS } from '../../constants/Palettes';

interface AddAppModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATALOG_APPS = Object.keys(KNOWN_ICONS).map((key) => ({
  id: key,
  name: key.charAt(0).toUpperCase() + key.slice(1),
  icon: KNOWN_ICONS[key],
}));

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 28,
  stiffness: 220,
  mass: 1,
  overshootClamping: false,
};

export function AddAppModal({ visible, onClose }: AddAppModalProps) {
  const { palette } = useThemeStore();
  const { apps, addApp } = useBlockedAppsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
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

  // Filter catalog based on search
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return CATALOG_APPS;

    
    const query = searchQuery.trim().toLowerCase();
    const matches = CATALOG_APPS.filter((app) => 
      app.name.toLowerCase().includes(query)
    );

    // If query is not in the catalog at all, add a "Custom" option at the end
    const exactMatch = matches.find(m => m.name.toLowerCase() === query);
    
    if (!exactMatch) {
      matches.push({
        id: 'custom-' + query,
        name: searchQuery.trim(),
        icon: null,
      });
    }

    return matches;
  }, [searchQuery]);

  const handleAdd = (appName: string) => {
    addApp(appName);
    setSearchQuery(''); // Clear search on add
  };

  const isAlreadyAdded = (appName: string) => {
    return apps.some(a => a.name.toLowerCase() === appName.toLowerCase());
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

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, animatedSheet]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardInner}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add App</Text>
            </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.inputWrapper}>
            <SearchNormal1 size={18} color="#777" style={{ marginLeft: 14 }} variant="Linear" />
            <TextInput
              style={styles.textInput}
              placeholder="Search or add custom app..."
              placeholderTextColor="#777"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Catalog List */}
        <FlatList
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const added = isAlreadyAdded(item.name);
            const isCustom = item.id.startsWith('custom-');

            return (
              <View style={styles.appRow}>
                <View style={styles.appRowLeft}>
                  <View style={styles.iconWrapper}>
                    {item.icon ? (
                      <Image source={item.icon} style={styles.iconImg} />
                    ) : (
                      <View style={[styles.iconPlaceholder, { backgroundColor: palette.focusColor + '20' }]}>
                        <Text style={[styles.iconLetter, { color: palette.focusColor }]}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.appName}>{item.name}</Text>
                    {isCustom && <Text style={styles.customLabel}>Custom App</Text>}
                  </View>
                </View>
                
                {added ? (
                  <View style={styles.addedBadge}>
                    <TickCircle size={18} color="#4ADE80" variant="Bold" />
                    <Text style={styles.addedText}>Added</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleAdd(item.name)} 
                    style={styles.addBtn}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                    <Add size={26} color={palette.focusColor} variant="Bold" />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
          </KeyboardAvoidingView>
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
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
  },
  keyboardInner: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    color: '#FFF',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  iconImg: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconLetter: {
    fontSize: 20,
    fontWeight: '800',
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#EEE',
  },
  customLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addedText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '700',
  },
});
