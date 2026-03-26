import React, { useState } from 'react';
import { View, Text, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface WeeklyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function WeeklyActivityChart({ history, palette }: WeeklyActivityChartProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const windowWidth = Dimensions.get('window').width;
  
  // Layout constants
  const chartHeight = 160;
  const tooltipHeight = 40; 
  const barWidth = 22;
  const yAxisWidth = 35;
  
  // Spacing
  const chartInnerPadding = 48; 
  const availableWidth = windowWidth - chartInnerPadding - 32; 
  const chartWidth = availableWidth - yAxisWidth; 
  const totalBarWidth = barWidth * 7;
  const gap = (chartWidth - totalBarWidth) / 6;

  // Week calculation (Current Monday - Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const mondayOffset = new Date(today.getTime());
  mondayOffset.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  mondayOffset.setHours(0, 0, 0, 0);

  // Previous Week calculation (for comparison)
  const prevMonday = new Date(mondayOffset);
  prevMonday.setDate(mondayOffset.getDate() - 7);
  const prevSunday = new Date(mondayOffset);
  prevSunday.setMilliseconds(-1);

  const getWeekMinutes = (start: Date, end: Date) => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const weekSessions = history.filter(r => 
      r.mode === 'focus' && 
      r.timestamp >= startTime && 
      r.timestamp <= endTime
    );
    return Math.round(weekSessions.reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
  };

  const displayMondayOffset = new Date(mondayOffset);
  displayMondayOffset.setDate(mondayOffset.getDate() - 1); 

  // DATA FETCHING: Clean data (no dummy injection)
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(displayMondayOffset);
    d.setDate(displayMondayOffset.getDate() + i);
    const start = d.getTime();
    const end = start + 86400000;
    const daySessions = history.filter(r => r.timestamp >= start && r.timestamp < end);
    const focusSecs = daySessions.filter(s => s.mode === 'focus').reduce((acc, s) => acc + s.durationInSeconds, 0);
    const breakSecs = daySessions.filter(s => s.mode === 'break').reduce((acc, s) => acc + s.durationInSeconds, 0);
    return { 
      focus: Math.round(focusSecs / 60), 
      break: Math.round(breakSecs / 60),
      total: Math.round((focusSecs + breakSecs) / 60)
    };
  });

  const thisWeekTotal = daysData.reduce((acc, d) => acc + d.focus, 0);
  const lastWeekTotal = getWeekMinutes(prevMonday, prevSunday) || 180; // Default baseline 3h
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const dailyAverage = Math.round(thisWeekTotal / 7);
  
  let diffPercent = 0;
  if (lastWeekTotal > 0) {
    diffPercent = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
  }

  // DYNAMIC SCALING: Base is 30 minutes, but scales up if data is larger
  const trueMax = Math.max(...daysData.map(d => d.total));
  const maxMinutes = Math.max(trueMax, 30); 

  // Dynamic Y-axis labels: Increased to 5 lines (0, 25%, 50%, 75%, 100%)
  const yLabels = [0, Math.round(maxMinutes * 0.25), Math.round(maxMinutes * 0.5), Math.round(maxMinutes * 0.75), maxMinutes];

  const handleTouch = (evt: GestureResponderEvent) => {
    const x = evt.nativeEvent.locationX;
    const step = barWidth + gap;
    const index = Math.round(x / (step > 0 ? step : 1));
    const clampedIndex = Math.max(0, Math.min(6, index));
    setActiveDayIndex(clampedIndex);
  };

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <View className="mt-2">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text style={{ color: palette.secondaryText }} className="text-sm font-medium opacity-60">Daily Average</Text>
          <Text style={{ color: palette.timerText }} className="text-4xl font-extrabold tracking-tight">
            {formatHours(dailyAverage)}
          </Text>
        </View>
        
        {diffPercent !== 0 && (
          <View className="flex-row items-center px-2 py-1 rounded-full mt-1" style={{ backgroundColor: palette.secondaryText + '15' }}>
            {diffPercent > 0 ? (
              <TrendingUp size={14} color="#4ADE80" />
            ) : (
              <TrendingDown size={14} color="#F87171" />
            )}
            <Text style={{ color: palette.secondaryText }} className="text-[12px] font-bold ml-1">
              {Math.abs(diffPercent)}% <Text className="font-normal opacity-60">from last week</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={{ width: availableWidth, height: chartHeight + tooltipHeight + 40 }} className="relative">
        {activeDayIndex !== null && (
          <View 
            style={{ 
              position: 'absolute',
              left: activeDayIndex * (barWidth + gap) + (barWidth / 2) - 24,
              top: 5, width: 48, height: 24, borderRadius: 12,
              backgroundColor: "#22D3EE", justifyContent: 'center', alignItems: 'center', zIndex: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 11 }}>
              {daysData[activeDayIndex].focus}m
            </Text>
          </View>
        )}

        <Svg height={chartHeight + tooltipHeight + 40} width={availableWidth}>
          <G transform={`translate(0, ${tooltipHeight})`}>
            {/* HORIZONTAL GRID LINES */}
            {yLabels.map((val, idx) => {
              const y = chartHeight - (val / maxMinutes) * chartHeight;
              const shouldShowLabel = idx === 0 || idx === 2 || idx === 4;
              return (
                <G key={val}>
                  <Line x1={0} y1={y} x2={chartWidth} y2={y} stroke={palette.secondaryText} strokeWidth="1" opacity="0.1" />
                  {shouldShowLabel && (
                    <SvgText x={chartWidth + 8} y={y + 4} fontSize="10" fill={palette.secondaryText} opacity="0.4" fontWeight="600">
                      {val === 0 ? '0' : (val < 60 ? `${val}m` : `${Math.floor(val/60)}h`)}
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* VERTICAL DIVIDER LINES (Behind) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <Line 
                key={i}
                x1={(i + 1) * (barWidth + gap) - gap/2} y1={0}
                x2={(i + 1) * (barWidth + gap) - gap/2} y2={chartHeight}
                stroke={palette.secondaryText} strokeWidth="1" opacity="0.08"
              />
            ))}

            {/* Bars */}
            {daysData.map((d, i) => {
              const focusH = (d.focus / maxMinutes) * chartHeight;
              const breakH = (d.break / maxMinutes) * chartHeight;
              const totalH = focusH + breakH;
              const x = i * (barWidth + gap);
              const isToday = i === today.getDay(); 
              const isActive = activeDayIndex === i;

              return (
                <G key={i}>
                  {/* FOCUS BAR (Blue) */}
                  {d.focus > 0 && (
                    <Rect
                      x={x} y={chartHeight - focusH} width={barWidth} height={focusH}
                      rx={0} fill="#3B82F6" opacity={isActive ? 1 : 0.9}
                    />
                  )}
                  {/* BREAK BAR (Orange) */}
                  {d.break > 0 && (
                    <Rect
                      x={x} y={chartHeight - focusH - breakH} width={barWidth} height={breakH}
                      rx={0} fill={palette.breakColor} opacity={isActive ? 1 : 0.9}
                    />
                  )}
                  <SvgText
                    x={x + barWidth / 2} y={chartHeight + 25}
                    fontSize="12" fill={palette.secondaryText}
                    textAnchor="middle" fontWeight={isToday ? "900" : "500"}
                    opacity={isToday ? 1 : 0.3}
                  >
                    {dayNames[i]}
                  </SvgText>
                </G>
              );
            })}

            {/* AVERAGE LINE (Superimposed) */}
            {dailyAverage > 0 && dailyAverage <= maxMinutes && (
               <G>
                  <Line 
                    x1={0} y1={chartHeight - (dailyAverage / maxMinutes) * chartHeight} 
                    x2={chartWidth} y2={chartHeight - (dailyAverage / maxMinutes) * chartHeight} 
                    stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4 3" 
                  />
                  <SvgText x={chartWidth + 8} y={chartHeight - (dailyAverage / maxMinutes) * chartHeight + 4} fontSize="10" fill="#4ADE80" fontWeight="bold">avg</SvgText>
               </G>
            )}
          </G>
        </Svg>

        <View 
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
          onResponderRelease={() => setActiveDayIndex(null)}
          onResponderTerminate={() => setActiveDayIndex(null)}
          style={{ position: 'absolute', top: tooltipHeight, left: 0, width: chartWidth, height: chartHeight, backgroundColor: 'transparent', zIndex: 5 }}
        />
      </View>
    </View>
  );
}
