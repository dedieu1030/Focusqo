import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useTimerStore } from '../../store/useTimerStore';

interface TimerDisplayProps {
  timeLeft: number;
  disabled?: boolean;
  editingUnit: 'min' | 'sec' | null;
  tempVal: string;
  onTempValChange: (v: string) => void;
  onSubmitEdit: () => void;
  onPressMin: () => void;
  onPressSec: () => void;
}

export function TimerDisplay({ 
  timeLeft, disabled, editingUnit, tempVal, onTempValChange, onSubmitEdit, onPressMin, onPressSec 
}: TimerDisplayProps) {
  const { palette } = useThemeStore();
  const { timerShape } = useTimerStore();

  const minInputRef = useRef<TextInput>(null);
  const secInputRef = useRef<TextInput>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  const getShapeStyles = () => {
    let s: any = { borderRadius: 48 };
    if (timerShape === 'rounded') s = { borderRadius: 54 };
    if (timerShape === 'circle') s = { borderRadius: 999 }; // Pill
    if (timerShape === 'arch') s = { borderTopLeftRadius: 999, borderTopRightRadius: 999, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 };
    
    return [styles.timeBlock, { backgroundColor: palette.timerBlock }, s];
  };

  return (
    <View style={styles.container}>
      {/* Minutes Block */}
      <TouchableOpacity 
        style={getShapeStyles()} 
        activeOpacity={1} 
        onPress={onPressMin}
        disabled={disabled}
      >
        {editingUnit === 'min' ? (
          <TextInput
            ref={minInputRef}
            style={[styles.timeText, { color: palette.timerText, textAlign: 'center', width: '100%', padding: 0, margin: 0, includeFontPadding: false }]}
            value={tempVal}
            onChangeText={onTempValChange}
            keyboardType="number-pad"
            maxLength={3}
            onBlur={onSubmitEdit}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
            {minStr}
          </Text>
        )}
      </TouchableOpacity>

      {/* Seconds Block */}
      <TouchableOpacity 
        style={getShapeStyles()} 
        activeOpacity={1} 
        onPress={onPressSec}
        disabled={disabled}
      >
        {editingUnit === 'sec' ? (
          <TextInput
            ref={secInputRef}
            style={[styles.timeText, { color: palette.timerText, textAlign: 'center', width: '100%', padding: 0, margin: 0, includeFontPadding: false }]}
            value={tempVal}
            onChangeText={onTempValChange}
            keyboardType="number-pad"
            maxLength={2}
            onBlur={onSubmitEdit}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.timeText, { color: palette.timerText }]} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
            {secStr}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 64,
    width: '100%',
    paddingHorizontal: 8,
  },
  timeBlock: {
    flex: 1, 
    aspectRatio: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 104,
    fontWeight: '700',
  },
});
