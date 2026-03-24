import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { TimerDisplay } from '../components/Timer/TimerDisplay';
import { TimerControls } from '../components/Timer/TimerControls';
import { useTimerStore } from '../store/useTimerStore';
import { useThemeStore } from '../store/useThemeStore';
import { Tag, X, Plus } from 'lucide-react-native';
import { useKeepAwake } from 'expo-keep-awake';

export function TimerScreen() {
  const { 
    mode, timerState, timeLeft, startTimer, pauseTimer, skipSession, resetTimer,
    labels, selectedLabelId, selectLabel, addLabel 
  } = useTimerStore();
  
  const { palette } = useThemeStore();
  const [isLabelModalVisible, setLabelModalVisible] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');

  // Keep screen awake if timer is running and it's a focus mode
  if (timerState === 'running' && mode === 'focus') {
    useKeepAwake();
  }

  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  const getModeTitle = () => {
    if (mode === 'focus') return 'Focus';
    if (mode === 'break') return 'Break';
    return 'Long Break';
  };

  const getHeaderModeText = () => {
    if (mode === 'focus') return 'Focus 25m';
    if (mode === 'break') return 'Break 5m';
    return 'Long Brk 15m'; // Simplified
  };

  const handleCreateLabel = () => {
    if (newLabelText.trim().length > 0) {
      addLabel(newLabelText.trim());
      setNewLabelText('');
    }
  };

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
        
        <TimerDisplay timeLeft={timeLeft} />
        
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
                <Plus color={palette.background} size={20} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
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
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '500',
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
