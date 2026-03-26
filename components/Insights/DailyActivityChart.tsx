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
    const actualMins = Math.round(history
      .filter(r => r.mode === 'focus' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    
    // Dummy injection for visual testing (only if history is empty)
    let dummy = 0;
    if (history.length === 0) {
      if (hour >= 9 && hour <= 12) dummy = Math.round(Math.random() * 40 + 20);
      if (hour >= 14 && hour <= 18) dummy = Math.round(Math.random() * 50 + 10);
      if (hour >= 20 && hour <= 23) dummy = Math.round(Math.random() * 30 + 5);
    }

    return Math.max(actualMins, dummy);
  });

  const maxMins = 60; // Hourly max is usually 60m
  const yLabels = [0, 30, 60];

  return (
    <View style={{ marginTop: 32, paddingBottom: 10 }}>
       <View className="flex-row items-center mb-4">
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
          <Text style={{ color: palette.secondaryText }} className="mx-4 text-[10px] font-black opacity-30 uppercase tracking-[2px]">Daily Breakdown</Text>
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
       </View>

      <View style={{ width: availableWidth, height: chartHeight + 30 }}>
        <Svg height={chartHeight + 30} width={availableWidth}>
          <Defs>
            <LinearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <Stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          
          <G>
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

            {/* Bars */}
            {hourlyData.map((mins, i) => {
              const x = i * (barW + gap);
              const barH = (mins / maxMins) * chartHeight;
              
              return (
                <G key={i}>
                  {/* Background track */}
                  <Rect x={x} y={0} width={barW} height={chartHeight} fill={palette.secondaryText} opacity="0.06" rx={0} />
                  {/* Progress bar */}
                  {mins > 0 && <Rect x={x} y={chartHeight - barH} width={barW} height={barH} fill="url(#blueGrad)" rx={0} />}
                  
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
    </View>
  );
}
