import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
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
  
  // Spacing: Expand to fill the container width 
  const chartInnerPadding = 48; 
  const chartWidth = windowWidth - chartInnerPadding - 32; 
  const totalBarWidth = barWidth * 7;
  const gap = (chartWidth - totalBarWidth) / 6;

  // Week calculation (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
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
      <View className="flex-row items-end justify-between w-full mb-6">
        <View>
          <Text style={{ color: palette.secondaryText }} className="text-[10px] uppercase font-bold tracking-widest opacity-60">WEEKLY TOTAL</Text>
          <Text style={{ color: palette.timerText }} className="text-3xl font-extrabold -mt-1 tracking-tight">
            {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
          </Text>
        </View>
      </View>

      <View style={{ width: chartWidth, height: chartHeight + tooltipHeight + 40 }}>
        <Svg height={chartHeight + tooltipHeight + 40} width={chartWidth}>
          <Defs>
            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={palette.focusColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={palette.focusColor} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          <G transform={`translate(0, ${tooltipHeight})`}>
            {dailyMinutes.map((mins, i) => {
              const barHeight = Math.max((mins / maxMinutes) * chartHeight, mins > 0 ? 8 : 2);
              const x = i * (barWidth + gap);
              const centerX = x + barWidth / 2;
              const y = chartHeight - barHeight;
              const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
              const isActive = activeDayIndex === i;

              return (
                <G 
                  key={i}
                  onPressIn={() => setActiveDayIndex(i)}
                  onPressOut={() => setActiveDayIndex(null)}
                >
                  <Rect
                    x={x - gap/2}
                    y={-tooltipHeight}
                    width={barWidth + gap}
                    height={chartHeight + 60}
                    fill="transparent"
                  />

                  <Rect
                    x={x}
                    y={0}
                    width={barWidth}
                    height={chartHeight}
                    rx={6}
                    fill={palette.secondaryText}
                    opacity={isActive ? "0.15" : "0.08"}
                  />
                  
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="url(#barGradient)"
                    opacity={isActive ? 1 : 0.9}
                  />
                  
                  <SvgText
                    x={centerX}
                    y={chartHeight + 25}
                    fontSize="11"
                    fill={isToday ? palette.timerText : palette.secondaryText}
                    textAnchor="middle"
                    fontWeight={isToday ? "900" : "600"}
                    opacity={isToday ? 1 : 0.6}
                  >
                    {dayNames[i]}
                  </SvgText>

                  {isActive && (
                    <G>
                      {/* Tooltip Background - FIXED TO BLUE (focusColor) */}
                      <Rect 
                        x={centerX - 24}
                        y={-32}
                        width={48}
                        height={24}
                        rx={12}
                        fill={palette.focusColor}
                      />
                      {/* Text explicitly centered */}
                      <SvgText
                        x={centerX}
                        y={-17}
                        fontSize="11"
                        fill="white"
                        textAnchor="middle"
                        fontWeight="900"
                      >
                        {mins}m
                      </SvgText>
                    </G>
                  )}
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
}
