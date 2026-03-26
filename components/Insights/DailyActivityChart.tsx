import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface DailyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function DailyActivityChart({ history, palette }: DailyActivityChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartHeight = 100;
  const chartInnerPadding = 48;
  const availableWidth = windowWidth - chartInnerPadding - 32;
  const yAxisWidth = 35;
  const chartAreaWidth = availableWidth - yAxisWidth;
  
  const slots = 24;
  const barW = 5;
  const gap = (chartAreaWidth - (barW * slots)) / (slots - 1);

  // Today's data (24 slots)
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const start = startOfToday + hour * 3600000;
    const end = start + 3600000;
    
    // Filter actual history
    const focusMins = Math.round(history
      .filter(r => r.mode === 'focus' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    const breakMins = Math.round(history
      .filter(r => r.mode === 'break' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    
    // Dummy injection for visual testing (only if history is low)
    let dFocus = 0;
    let dBreak = 0;
    if (history.length < 50) { // If mostly dummy data in global history
      if (hour >= 9 && hour <= 12) {
        dFocus = Math.round(Math.random() * 30 + 15);
        dBreak = Math.round(Math.random() * 10 + 5);
      }
      if (hour >= 14 && hour <= 18) {
        dFocus = Math.round(Math.random() * 40 + 10);
        dBreak = Math.round(Math.random() * 5 + 5);
      }
      if (hour >= 20 && hour <= 23) {
        dFocus = Math.round(Math.random() * 20 + 5);
        dBreak = Math.round(Math.random() * 5);
      }
    }

    const f = Math.max(focusMins, dFocus);
    const b = Math.max(breakMins, dBreak);
    return { focus: f, break: b, total: f + b };
  });

  const maxMins = 60; // Hourly max is usually 60m
  const yLabels = [0, 15, 30, 45, 60];

  return (
    <View style={{ marginTop: 32, paddingBottom: 10 }}>
       <View className="flex-row items-center mb-4">
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
          <Text style={{ color: palette.secondaryText }} className="mx-4 text-[10px] font-black opacity-30 uppercase tracking-[2px]">Daily Breakdown</Text>
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
       </View>

      <View style={{ width: availableWidth, height: chartHeight + 50 }}>
        <Svg height={chartHeight + 50} width={availableWidth}>
          <G transform="translate(0, 15)">
            {/* Grid */}
            {yLabels.map((val) => {
              const y = chartHeight - (val / maxMins) * chartHeight;
              return (
                <G key={val}>
                   <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.secondaryText} strokeWidth="1" opacity="0.05" />
                   <SvgText x={chartAreaWidth + 8} y={y + 3} fontSize="9" fill={palette.secondaryText} opacity="0.4" fontWeight="600">
                     {val}m
                   </SvgText>
                </G>
              );
            })}

            {/* VERTICAL DIVIDER LINES */}
            {Array.from({ length: 23 }).map((_, i) => (
              <Line 
                key={i}
                x1={(i + 1) * (barW + gap) - gap/2} y1={0}
                x2={(i + 1) * (barW + gap) - gap/2} y2={chartHeight}
                stroke={palette.secondaryText} strokeWidth="1" opacity="0.03"
              />
            ))}

            {/* Bars */}
            {hourlyData.map((d, i) => {
              const x = i * (barW + gap);
              const focusH = (d.focus / maxMins) * chartHeight;
              const breakH = (d.break / maxMins) * chartHeight;
              
              return (
                <G key={i}>
                  {/* Focus bar (Blue) */}
                  {d.focus > 0 && <Rect x={x} y={chartHeight - focusH} width={barW} height={focusH} fill="#3B82F6" rx={0} />}
                  {/* Break bar (Orange) */}
                  {d.break > 0 && <Rect x={x} y={chartHeight - focusH - breakH} width={barW} height={breakH} fill={palette.breakColor} rx={0} />}
                  
                  {/* Time labels (selected hours) */}
                  {(i === 0 || i === 6 || i === 12 || i === 18) && (
                    <SvgText x={x} y={chartHeight + 20} fontSize="8" fill={palette.secondaryText} opacity="0.4" textAnchor="start" fontWeight="bold">
                      {i === 0 ? '12 AM' : i === 12 ? '12 PM' : `${i > 12 ? i-12 : i} ${i>=12?'PM':'AM'}`}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-6 gap-6">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
          <Text style={{ color: palette.secondaryText }} className="text-[12px] font-bold opacity-60">Focus</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: palette.breakColor }} />
          <Text style={{ color: palette.secondaryText }} className="text-[12px] font-bold opacity-60">Break</Text>
        </View>
      </View>
    </View>
  );
}
