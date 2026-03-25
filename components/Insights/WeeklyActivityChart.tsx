import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface WeeklyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function WeeklyActivityChart({ history, palette }: WeeklyActivityChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const paddingX = 40; // Total horizontal padding for the bento card
  const chartWidth = windowWidth - paddingX - 40; // Extra inner padding
  const chartHeight = 150;
  const barWidth = 22;
  
  // Calculate gaps to perfectly space 7 bars across the width
  const totalBarWidth = barWidth * 7;
  const gap = (chartWidth - totalBarWidth) / 6;

  // Get the start of the current week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
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

  const maxMinutes = Math.max(...dailyMinutes, 60); // At least 1h scale
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const totalWeeklyMinutes = dailyMinutes.reduce((acc, m) => acc + m, 0);

  return (
    <View className="items-center mt-2 px-1">
      <View className="flex-row items-end justify-between w-full mb-6 px-2">
        <View>
          <Text style={{ color: palette.secondaryText }} className="text-[10px] uppercase font-bold tracking-widest opacity-60">WEEKLY TOTAL</Text>
          <Text style={{ color: palette.timerText }} className="text-3xl font-extrabold -mt-1 tracking-tight">
            {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
          </Text>
        </View>
      </View>

      <View style={{ width: chartWidth, height: chartHeight + 40 }}>
        <Svg height={chartHeight + 40} width={chartWidth}>
          <Defs>
            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={palette.focusColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={palette.focusColor} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          {/* Y-Axis Guideline (60m) only if logic requires it */}
          {maxMinutes >= 60 && (
            <Line 
              x1="0" y1={chartHeight - (60 / maxMinutes) * chartHeight} 
              x2={chartWidth} y2={chartHeight - (60 / maxMinutes) * chartHeight} 
              stroke={palette.secondaryText} 
              strokeWidth="0.5" 
              strokeDasharray="4 4" 
              opacity="0.2" 
            />
          )}

          {dailyMinutes.map((mins, i) => {
            const barHeight = Math.max((mins / maxMinutes) * chartHeight, mins > 0 ? 6 : 0);
            const x = i * (barWidth + gap);
            const y = chartHeight - barHeight;
            const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

            return (
              <G key={i}>
                {/* Background bar (Slot) */}
                <Rect
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  rx={5}
                  fill={palette.secondaryText}
                  opacity="0.08"
                />
                
                {/* Data bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={5}
                  fill="url(#barGradient)"
                />
                
                {/* Day Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 22}
                  fontSize="11"
                  fill={isToday ? palette.timerText : palette.secondaryText}
                  textAnchor="middle"
                  fontWeight={isToday ? "900" : "600"}
                  opacity={isToday ? 1 : 0.6}
                >
                  {dayNames[i]}
                </SvgText>

                {/* Minute value above bar (only if > 0) */}
                {mins > 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={Math.max(y - 12, 10)}
                    fontSize="10"
                    fill={palette.primaryText}
                    textAnchor="middle"
                    fontWeight="800"
                  >
                    {mins}m
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
