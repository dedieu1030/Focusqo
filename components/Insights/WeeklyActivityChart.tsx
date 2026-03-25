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
  const chartHeight = 160;
  const chartWidth = Dimensions.get('window').width - 80;
  const barWidth = 24;
  const barGap = (chartWidth - barWidth * 7) / 10; // More overlap/spacing

  // Get the start of the current week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
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
  
  // Total of the week
  const totalWeeklyMinutes = dailyMinutes.reduce((acc, m) => acc + m, 0);

  return (
    <View className="items-center mt-2 px-2">
      <View className="flex-row items-end justify-between w-full mb-4 px-2">
        <View>
          <Text style={{ color: palette.secondaryText }} className="text-xs uppercase font-medium">Weekly Total</Text>
          <Text style={{ color: palette.timerText }} className="text-2xl font-bold">
            {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
          </Text>
        </View>
      </View>

      <Svg height={chartHeight + 35} width={chartWidth}>
        <Defs>
          <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={palette.focusColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={palette.focusColor} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>

        {/* Y-Axis Guideline (60m) */}
        {maxMinutes >= 60 && (
          <Line 
            x1="0" y1={chartHeight - (60 / maxMinutes) * chartHeight} 
            x2={chartWidth} y2={chartHeight - (60 / maxMinutes) * chartHeight} 
            stroke={palette.secondaryText} 
            strokeWidth="0.5" 
            strokeDasharray="4 4" 
            opacity="0.3" 
          />
        )}

        {dailyMinutes.map((mins, i) => {
          const barHeight = Math.max((mins / maxMinutes) * chartHeight, mins > 0 ? 4 : 0);
          const x = i * (barWidth + barGap);
          const y = chartHeight - barHeight;

          return (
            <G key={i}>
              {/* Background bar to show "potential" slot */}
              <Rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                rx={6}
                fill={palette.secondaryText}
                opacity="0.05"
              />
              
              {/* Actual data bar */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill="url(#barGradient)"
              />
              
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 20}
                fontSize="12"
                fill={mins > 0 ? palette.timerText : palette.secondaryText}
                textAnchor="middle"
                fontWeight={mins > 0 ? "700" : "500"}
              >
                {dayNames[i]}
              </SvgText>

              {mins > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 8}
                  fontSize="11"
                  fill={palette.primaryText}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {mins}m
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
