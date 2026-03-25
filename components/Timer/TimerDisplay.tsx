import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    
    return [styles.timeBlock, { backgroundColor: palette.timerBlock, overflow: 'hidden' }, s];
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
        <LinearGradient
          colors={[palette.timerBlock, palette.timerBlock + 'CC']}
          style={styles.gradient}
        >
          <View style={styles.reflectiveEdge} />
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
        </LinearGradient>
      </TouchableOpacity>

      {/* Seconds Block */}
      <TouchableOpacity 
        style={getShapeStyles()} 
        activeOpacity={1} 
        onPress={onPressSec}
        disabled={disabled}
      >
        <LinearGradient
          colors={[palette.timerBlock, palette.timerBlock + 'CC']}
          style={styles.gradient}
        >
          <View style={styles.reflectiveEdge} />
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
        </LinearGradient>
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
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reflectiveEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  timeText: {
    fontSize: 104,
    fontWeight: '700',
  },
});
