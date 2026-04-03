import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useSleepStore } from '../store/useSleepStore';
import { useThemeStore } from '../store/useThemeStore';
import { Moon, Warning2, Flash } from 'iconsax-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface FrictionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FrictionModal({ visible, onClose }: FrictionModalProps) {
  const { sleepTime, sleepDuration } = useSleepStore();
  const { palette } = useThemeStore();

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.85)' }]} 
        />
        <Animated.View 
          entering={SlideInDown.springify().damping(12).stiffness(100)}
          style={[styles.modalContent, { backgroundColor: palette.timerBlock, borderTopColor: palette.focusColor + '40' }]}
        >
          <View style={styles.handle} />
          
          <View className="items-center mt-6">
            <View style={{ backgroundColor: palette.focusColor + '20' }} className="p-6 rounded-full mb-6">
              <Flash size={48} color={palette.focusColor} variant="Bold" />
            </View>
            
            <Text style={{ color: palette.primaryText }} className="text-2xl font-bold text-center px-4">
              Tu voulais dormir à {sleepTime}
            </Text>
            
            <Text style={{ color: palette.secondaryText }} className="text-center mt-4 text-base px-8 leading-6">
              Est-ce que ce scroll vaut ton énergie de demain ?
            </Text>

            <View style={{ backgroundColor: '#00000040' }} className="mt-6 p-4 rounded-2xl flex-row items-center gap-3">
               <Moon size={20} color={palette.secondaryText} />
               <Text style={{ color: palette.secondaryText }} className="text-sm font-medium">
                 Objectif : {Math.floor(sleepDuration)}h de repos
               </Text>
            </View>
          </View>

          <View className="mt-12 gap-3 pb-8">
            <TouchableOpacity 
              onPress={onClose}
              style={{ backgroundColor: palette.focusColor }}
              className="py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">Retourner dormir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onClose}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="py-4 rounded-2xl items-center"
            >
              <Text style={{ color: palette.primaryText }} className="font-semibold text-base">Juste 5 minutes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onClose}
              className="py-2 items-center"
            >
              <Text style={{ color: palette.secondaryText }} className="text-sm opacity-50 underline italic">Mode "juste 1 vidéo"</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
  },
});
