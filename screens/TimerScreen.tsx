import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { TimerDisplay } from '../components/Timer/TimerDisplay';
import { TimerControls } from '../components/Timer/TimerControls';
import { useTimerStore } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Tag, X, Plus } from 'lucide-react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export function TimerScreen() {
  const { 
    mode, timerState, timeLeft, startTimer, pauseTimer, skipSession, resetTimer,
    labels, selectedLabelId, selectLabel, addLabel,
    focusDurationMin, breakDurationMin, longBreakDurationMin, updateSettings
  } = useTimerStore();
  
  const { palette } = useThemeStore();
  const [isLabelModalVisible, setLabelModalVisible] = useState(false);
  const [isDurationModalVisible, setDurationModalVisible] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');

  // Keep screen awake if timer is running and it's a focus mode
  React.useEffect(() => {
    if (timerState === 'running' && mode === 'focus') {
      activateKeepAwakeAsync().catch(() => {});
    } else {
      deactivateKeepAwake();
    }
  }, [timerState, mode]);

  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  const getModeTitle = () => {
    if (mode === 'focus') return 'Focus';
    if (mode === 'break') return 'Break';
    return 'Long Break';
  };

  const getHeaderModeText = () => {
    if (mode === 'focus') return `Focus ${focusDurationMin}m`;
    if (mode === 'break') return `Break ${breakDurationMin}m`;
    return `Long Brk ${longBreakDurationMin}m`;
  };

  const handleCreateLabel = () => {
    if (newLabelText.trim().length > 0) {
      addLabel(newLabelText.trim());
      setNewLabelText('');
    }
  };

  const handleAdjustTime = (delta: number) => {
    let current = focusDurationMin;
    let key: 'focusDurationMin' | 'breakDurationMin' | 'longBreakDurationMin' = 'focusDurationMin';
    if (mode === 'break') {
      current = breakDurationMin;
      key = 'breakDurationMin';
    } else if (mode === 'longBreak') {
      current = longBreakDurationMin;
      key = 'longBreakDurationMin';
    }
    const newValue = Math.max(1, Math.min(120, current + delta));
    updateSettings({ [key]: newValue });
  };

  const currentDurationValue = mode === 'focus' ? focusDurationMin : (mode === 'break' ? breakDurationMin : longBreakDurationMin);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => setLabelModalVisible(true)}>
          <Tag size={16} color={palette.secondaryText} style={{ marginRight: 6 }} />
          <Text style={[styles.headerLabelText, { color: palette.secondaryText }]}>
            {selectedLabel ? selectedLabel.name : 'No Label'}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={[styles.headerModeText, { color: mode === 'focus' ? palette.secondaryText : palette.breakColor }]}>
            {getHeaderModeText()}
          </Text>
        </View>
      </View>

      <View style={styles.timerContent}>
        <Text style={[
          styles.modeTitle, 
          { color: mode === 'focus' ? palette.primaryText : palette.breakColor }
        ]}>
          {getModeTitle()}
        </Text>
        
        <TimerDisplay 
          timeLeft={timeLeft} 
          onPress={() => {
            if (timerState === 'idle') {
              setDurationModalVisible(true);
            }
          }}
          disabled={timerState !== 'idle'} 
        />
        
        <TimerControls 
          timerState={timerState} 
          onStart={startTimer}
          onPause={pauseTimer}
          onSkip={skipSession} 
          onReset={resetTimer}
        />
      </View>

      {/* Duration Modification Modal */}
      <Modal visible={isDurationModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.background, alignItems: 'center' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <Text style={[styles.modalTitle, { color: palette.primaryText }]}>Set {getModeTitle()} Time</Text>
              <TouchableOpacity onPress={() => setDurationModalVisible(false)} style={{ padding: 4 }}>
                <X color={palette.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.stepperContainer}>
              <TouchableOpacity 
                style={[styles.stepperBtnCenter, { backgroundColor: palette.timerBlock }]}
                onPress={() => handleAdjustTime(-5)}
              >
                <Text style={{ fontSize: 32, fontWeight: '400', color: palette.timerText, marginTop: -4 }}>-</Text>
              </TouchableOpacity>
              
              <Text style={[styles.stepperValueText, { color: palette.primaryText }]}>
                {currentDurationValue}
              </Text>
              
              <TouchableOpacity 
                style={[styles.stepperBtnCenter, { backgroundColor: palette.timerBlock }]}
                onPress={() => handleAdjustTime(5)}
              >
                <Text style={{ fontSize: 32, fontWeight: '400', color: palette.timerText, marginTop: -4 }}>+</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: palette.secondaryText, marginTop: 16, textAlign: 'center' }}>
              Changes the default duration for {getModeTitle()} sessions.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Label Selection Modal */}
      <Modal visible={isLabelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.primaryText }]}>Select Label</Text>
              <TouchableOpacity onPress={() => setLabelModalVisible(false)}>
                <X color={palette.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.labelsList}>
              <TouchableOpacity 
                style={[styles.labelItem, selectedLabelId === null && { backgroundColor: palette.timerBlock + '20' }]}
                onPress={() => { selectLabel(null); setLabelModalVisible(false); }}
              >
                <Text style={{ color: palette.primaryText }}>None</Text>
              </TouchableOpacity>
              
              {labels.map(label => (
                <TouchableOpacity 
                  key={label.id}
                  style={[styles.labelItem, selectedLabelId === label.id && { backgroundColor: palette.timerBlock + '20' }]}
                  onPress={() => { selectLabel(label.id); setLabelModalVisible(false); }}
                >
                  <Text style={{ color: palette.primaryText }}>{label.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.createLabelRow}>
              <TextInput 
                style={[styles.labelInput, { color: palette.primaryText, borderColor: palette.accentColor }]}
                placeholder="New label..."
                placeholderTextColor={palette.secondaryText}
                value={newLabelText}
                onChangeText={setNewLabelText}
                onSubmitEditing={handleCreateLabel}
              />
              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: palette.timerBlock }]}
                onPress={handleCreateLabel}
              >
                <Plus color={palette.timerText} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerLabelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerRight: {},
  headerModeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    paddingHorizontal: 16,
    width: '100%',
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  labelsList: {
    gap: 8,
    marginBottom: 24,
  },
  labelItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  createLabelRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  labelInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createBtn: {
    padding: 12,
    borderRadius: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginVertical: 24,
  },
  stepperBtnCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontSize: 48,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
  },
});
