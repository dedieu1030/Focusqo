import React, { useState } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface WeeklyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function WeeklyActivityChart({ history, palette }: WeeklyActivityChartProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const windowWidth = Dimensions.get('window').width;
  
  // Layout constants
  const chartHeight = 150;
  const tooltipHeight = 40; 
  const barWidth = 24;
  
  // Spacing
  const chartInnerPadding = 48; 
  const chartWidth = windowWidth - chartInnerPadding - 32; 
  const totalBarWidth = barWidth * 7;
  const gap = (chartWidth - totalBarWidth) / 6;

  // Week calculation
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const mondayOffset = new Date(today.getTime());
  mondayOffset.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  mondayOffset.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayOffset);
    d.setDate(mondayOffset.getDate() + i);
    return d;
  });

  const dailyMinutes = weekDays.map(day => {
    const start = day.getTime();
    const end = start + 86400000;
    const daySessions = history.filter(r => 
      r.mode === 'focus' && 
      r.timestamp >= start && 
      r.timestamp < end
    );
    const totalSeconds = daySessions.reduce((acc, r) => acc + r.durationInSeconds, 0);
    return Math.round(totalSeconds / 60);
  });

  const maxMinutes = Math.max(...dailyMinutes, 60);
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const totalWeeklyMinutes = dailyMinutes.reduce((acc, m) => acc + m, 0);

  return (
    <View className="items-center mt-2">
      <View className="flex-row items-end justify-between w-full mb-6 max-w-full">
        <View>
          <Text style={{ color: palette.secondaryText }} className="text-[10px] uppercase font-bold tracking-widest opacity-60">WEEKLY TOTAL</Text>
          <Text style={{ color: palette.timerText }} className="text-3xl font-extrabold -mt-1 tracking-tight">
            {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
          </Text>
        </View>
      </View>

      <View style={{ width: chartWidth, height: chartHeight + tooltipHeight + 40 }} className="relative">
        {/* Tooltip Layer using absolute View for PERFECT centering and stability */}
        {activeDayIndex !== null && (
          <View 
            style={{ 
              position: 'absolute',
              // Center it horizontally over the active bar
              left: activeDayIndex * (barWidth + gap) + barWidth / 2 - 24,
              top: 5, // Match our y = -32 logic in the shifted group
              width: 48,
              height: 24,
              borderRadius: 12,
              backgroundColor: palette.focusColor,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 11 }}>
              {dailyMinutes[activeDayIndex]}m
            </Text>
          </View>
        )}

        <Svg height={chartHeight + tooltipHeight + 40} width={chartWidth}>
          <Defs>
            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={palette.focusColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={palette.focusColor} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          <G transform={`translate(0, ${tooltipHeight})`}>
            {maxMinutes >= 60 && (
              <Line 
                x1={0} y1={chartHeight - (60 / maxMinutes) * chartHeight} 
                x2={chartWidth} y2={chartHeight - (60 / maxMinutes) * chartHeight} 
                stroke={palette.secondaryText} 
                strokeWidth="0.5" 
                strokeDasharray="4 4" 
                opacity="0.1" 
              />
            )}

            {dailyMinutes.map((mins, i) => {
              const barHeight = Math.max((mins / maxMinutes) * chartHeight, mins > 0 ? 8 : 2);
              const x = i * (barWidth + gap);
              const y = chartHeight - barHeight;
              const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

              return (
                <G key={i}>
                  <Rect
                    x={x}
                    y={0}
                    width={barWidth}
                    height={chartHeight}
                    rx={6}
                    fill={palette.secondaryText}
                    opacity="0.08"
                  />
                  
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="url(#barGradient)"
                    opacity="0.9"
                  />
                  
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight + 25}
                    fontSize="11"
                    fill={isToday ? palette.timerText : palette.secondaryText}
                    textAnchor="middle"
                    fontWeight={isToday ? "900" : "600"}
                    opacity={isToday ? 1 : 0.6}
                  >
                    {dayNames[i]}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>

        {/* Interaction Layer: Transparent Pressables for 100% stability */}
        <View 
          style={{ 
            position: 'absolute', 
            top: tooltipHeight, 
            left: 0, 
            width: chartWidth, 
            height: chartHeight, 
            flexDirection: 'row',
            pointerEvents: 'box-none'
          }}
        >
          {dailyMinutes.map((_, i) => (
            <Pressable 
              key={i}
              onPressIn={() => setActiveDayIndex(i)}
              onPressOut={() => setActiveDayIndex(null)}
              style={{ 
                width: barWidth, 
                height: chartHeight,
                marginRight: i < 6 ? gap : 0,
                backgroundColor: 'transparent'
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
