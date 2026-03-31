import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
    focusDurationMin, focusDurationSec, breakDurationMin, breakDurationSec, longBreakDurationMin, longBreakDurationSec, updateSettings
  } = useTimerStore();
  
  const { palette } = useThemeStore();
  const [isLabelModalVisible, setLabelModalVisible] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  
  const [editingUnit, setEditingUnit] = useState<'min' | 'sec' | null>(null);
  const [tempVal, setTempVal] = useState('');

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

  const handleCreateLabel = () => {
    if (newLabelText.trim().length > 0) {
      addLabel(newLabelText.trim());
      setNewLabelText('');
    }
  };

  const handlePressMin = () => {
    if (timerState !== 'running') {
      const durMin = mode === 'focus' ? focusDurationMin : (mode === 'break' ? breakDurationMin : longBreakDurationMin);
      setTempVal(String(durMin));
      setEditingUnit('min');
    }
  };

  const handlePressSec = () => {
    if (timerState !== 'running') {
      const durSec = mode === 'focus' ? focusDurationSec : (mode === 'break' ? breakDurationSec : longBreakDurationSec);
      setTempVal(String(durSec));
      setEditingUnit('sec');
    }
  };

  const handleSubmitEdit = () => {
    if (!editingUnit) return;
    
    let val = parseInt(tempVal, 10);
    if (isNaN(val) || val < 0) val = 0;

    let keyMin: any = 'focusDurationMin';
    let keySec: any = 'focusDurationSec';
    if (mode === 'break') { keyMin = 'breakDurationMin'; keySec = 'breakDurationSec'; }
    if (mode === 'longBreak') { keyMin = 'longBreakDurationMin'; keySec = 'longBreakDurationSec'; }

    if (editingUnit === 'min' && val > 180) val = 180;
    if (editingUnit === 'sec' && val > 59) val = 59;
    
    let newMin = editingUnit === 'min' ? val : (mode === 'focus' ? focusDurationMin : (mode === 'break' ? breakDurationMin : longBreakDurationMin));
    let newSec = editingUnit === 'sec' ? val : (mode === 'focus' ? focusDurationSec : (mode === 'break' ? breakDurationSec : longBreakDurationSec));
    
    if (newMin === 0 && newSec === 0) {
      val = 1; // Prevent 0 time
    }

    const keyToUpdate = editingUnit === 'min' ? keyMin : keySec;
    updateSettings({ [keyToUpdate]: val });
    
    if (timerState === 'paused' || timerState === 'finished') {
      resetTimer();
    }
    setEditingUnit(null);
  };

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); handleSubmitEdit(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.timerContent}>          <Text style={[
            styles.modeTitle, 
            { color: mode === 'focus' ? palette.primaryText : palette.breakColor }
          ]}>
            {getModeTitle()}
          </Text>
          
          <TimerDisplay 
            timeLeft={timeLeft} 
            editingUnit={editingUnit}
            tempVal={tempVal}
            onTempValChange={setTempVal}
            onSubmitEdit={handleSubmitEdit}
            onPressMin={handlePressMin}
            onPressSec={handlePressSec}
            disabled={timerState === 'running'} 
          />
          
          <TimerControls 
            timerState={timerState} 
            onStart={startTimer}
            onPause={pauseTimer}
            onSkip={skipSession} 
            onReset={resetTimer}
          />
        </View>

        {/* Label Selection Modal */}
        <Modal visible={isLabelModalVisible} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
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
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  modeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 70,
    letterSpacing: 0.5,
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
});
