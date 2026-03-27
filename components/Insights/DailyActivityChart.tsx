import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface DailyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
  date?: Date;
}

export function DailyActivityChart({ history, palette, date }: DailyActivityChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartHeight = 120;
  const chartInnerPadding = 48;
  const availableWidth = windowWidth - chartInnerPadding - 32;
  const yAxisWidth = 35;
  const chartAreaWidth = availableWidth - yAxisWidth;
  
  const slots = 24;
  const slotWidth = chartAreaWidth / slots;
  const barW = 7;
  const barWidthHorizontalOffset = (slotWidth - barW) / 2;

  // Selected day's data (24 slots)
  const baseDate = date || new Date();
  const startOfSelectedDay = new Date(baseDate).setHours(0, 0, 0, 0);
  
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const start = startOfSelectedDay + hour * 3600000;
    const end = start + 3600000;
    
    let focusMins = 0;
    let breakMins = 0;

    // Filter and compute overlap for each session to properly attribute time to the right hour slot
    history.forEach(r => {
      const sessionStart = r.timestamp;
      const sessionEnd = r.timestamp + r.durationInSeconds * 1000;

      const overlapStart = Math.max(start, sessionStart);
      const overlapEnd = Math.min(end, sessionEnd);

      if (overlapEnd > overlapStart) {
        const durationSec = (overlapEnd - overlapStart) / 1000;
        if (r.mode === 'focus') focusMins += durationSec / 60;
        else breakMins += durationSec / 60;
      }
    });

    return { 
      focus: focusMins, 
      break: breakMins, 
      total: focusMins + breakMins 
    };
  });

  const maxMins = 60; 
  const yLabels = [0, 15, 30, 45, 60];

  return (
    <View style={{ marginTop: 32, paddingBottom: 10 }}>
       <View className="flex-row items-center mb-4">
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.timerText }} />
          <Text style={{ color: palette.timerText }} className="mx-4 text-[11px] font-bold opacity-60">Daily breakdown</Text>
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.timerText }} />
       </View>

      <View style={{ width: availableWidth, height: chartHeight + 60 }}>
        <Svg height={chartHeight + 60} width={availableWidth}>
          <G transform="translate(0, 20)">
            {/* Grid */}
            {yLabels.map((val) => {
              const y = chartHeight - (val / maxMins) * chartHeight;
              const isSignificant = val === 0 || val === 30 || val === 60;
              return (
                <G key={val}>
                   <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.timerText} strokeWidth="1" opacity="0.1" />
                   {isSignificant && (
                     <SvgText x={chartAreaWidth + 8} y={y + 3} fontSize="9" fill={palette.timerText} opacity="0.7" fontWeight="600">
                       {val}m
                     </SvgText>
                   )}
                </G>
              );
            })}

            {/* VERTICAL DIVIDER LINES */}
            {[0, 6, 12, 18, 24].map((hour) => {
              const x = hour * slotWidth;
              return (
                <Line 
                  key={hour}
                  x1={x} y1={0}
                  x2={x} y2={chartHeight}
                  stroke={palette.timerText} strokeWidth="1" opacity="0.12"
                />
              );
            })}

            {/* Bars */}
            {hourlyData.map((d, i) => {
              const x = i * slotWidth + barWidthHorizontalOffset;
              
              // Ensure we never exceed 60m total to prevent visual overflow
              const total = d.focus + d.break;
              const scale = total > 60 ? 60 / total : 1;
              const focusScaled = d.focus * scale;
              const breakScaled = d.break * scale;

              const focusH = (focusScaled / maxMins) * chartHeight;
              const breakH = (breakScaled / maxMins) * chartHeight;
              
              const radius = 2; // Subtle corner radius

              return (
                <G key={i}>
                  {/* Focus bar (Blue) */}
                  {focusScaled > 0.5 && (
                    <Path
                      d={breakScaled > 0.5 
                        ? `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH} L${x},${chartHeight-focusH} Z`
                        : `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH+radius} Q${x+barW},${chartHeight-focusH} ${x+barW-radius},${chartHeight-focusH} L${x+radius},${chartHeight-focusH} Q${x},${chartHeight-focusH} ${x},${chartHeight-focusH+radius} Z`
                      }
                      fill="#3B82F6"
                    />
                  )}
                  {/* Break bar (Orange) */}
                  {breakScaled > 0.5 && (
                    <Path
                      d={`M${x},${chartHeight-focusH} L${x+barW},${chartHeight-focusH} L${x+barW},${chartHeight-focusH-breakH+radius} Q${x+barW},${chartHeight-focusH-breakH} ${x+barW-radius},${chartHeight-focusH-breakH} L${x+radius},${chartHeight-focusH-breakH} Q${x},${chartHeight-focusH-breakH} ${x},${chartHeight-focusH-breakH+radius} Z`}
                      fill={palette.breakColor}
                    />
                  )}
                  
                  {/* Time labels (selected hours) */}
                  {(i === 0 || i === 6 || i === 12 || i === 18) && (
                    <SvgText x={i * slotWidth} y={chartHeight + 25} fontSize="9" fill={palette.timerText} opacity="0.7" textAnchor="start" fontWeight="bold">
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
          <Text style={{ color: palette.timerText }} className="text-[12px] font-bold opacity-60">Focus</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: palette.breakColor }} />
          <Text style={{ color: palette.timerText }} className="text-[12px] font-bold opacity-60">Break</Text>
        </View>
      </View>
    </View>
  );
}
