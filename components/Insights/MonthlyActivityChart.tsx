import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { G, Text as SvgText, Line, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface MonthlyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}
export function MonthlyActivityChart({ history, palette }: MonthlyActivityChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartHeight = 150;
  const chartInnerPadding = 48;
  const availableWidth = windowWidth - chartInnerPadding - 32;
  const yAxisWidth = 35;
  const chartAreaWidth = availableWidth - yAxisWidth;

  // Current Calendar Month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const slots = daysInMonth;
  const slotWidth = chartAreaWidth / slots;
  const barW = Math.max(2, slotWidth * 0.6); // Reactive bar width
  const barOffset = (slotWidth - barW) / 2;

  const daysData = Array.from({ length: slots }, (_, i) => {
    const day = i + 1;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    const end = start + 86400000;

    // Only process if the day is not in the future
    const isFuture = start > now.getTime();
    
    if (isFuture) {
      return { focus: 0, break: 0, total: 0, date: d };
    }

    const focusMins = Math.round(history
      .filter(r => r.mode === 'focus' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    const breakMins = Math.round(history
      .filter(r => r.mode === 'break' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);

    return { focus: focusMins, break: breakMins, total: focusMins + breakMins, date: d };
  });

  const maxMins = Math.max(120, ...daysData.map(d => d.total));
  const yLabels = [0, maxMins * 0.25, maxMins * 0.5, maxMins * 0.75, maxMins];

  return (
    <View style={{ marginTop: 20 }}>
      <View className="flex-row items-center mb-6">
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
          <Text style={{ color: palette.secondaryText }} className="mx-4 text-[10px] font-black opacity-40 uppercase tracking-[2px]">Monthly Activity</Text>
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
      </View>

      <View style={{ width: availableWidth, height: chartHeight + 40 }}>
        <Svg height={chartHeight + 40} width={availableWidth}>
          <G transform="translate(0, 10)">
            {/* Grid Lines */}
            {yLabels.map((val, i) => {
              const y = chartHeight - (val / maxMins) * chartHeight;
              const isSignificant = i === 0 || i === 2 || i === 4;
              return (
                <G key={i}>
                   <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.secondaryText} strokeWidth="1" opacity="0.1" />
                   {isSignificant && (
                     <SvgText x={chartAreaWidth + 8} y={y + 3} fontSize="9" fill={palette.secondaryText} opacity="0.4" fontWeight="600">
                       {Math.round(val)}m
                     </SvgText>
                   )}
                </G>
              );
            })}

            {/* Vertical Dividers (5 lines standard) */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const x = p * chartAreaWidth;
              return (
                <Line 
                  key={i} 
                  x1={x} y1={0} 
                  x2={x} y2={chartHeight} 
                  stroke={palette.secondaryText} 
                  strokeWidth="1" 
                  opacity="0.12"
                />
              );
            })}

            {/* Bars with Centered Labels */}
            {daysData.map((d, i) => {
              const x = i * slotWidth + barOffset;
              const focusH = (d.focus / maxMins) * chartHeight;
              const breakH = (d.break / maxMins) * chartHeight;

              // Show centered labels under specific bars (approx 1/4 intervals)
              const showLabel = i === 0 || i === Math.floor(slots * 0.25) || i === Math.floor(slots * 0.5) || i === Math.floor(slots * 0.75) || i === slots - 1;

              return (
                <G key={i}>
                  {d.focus > 0 && (
                    <Path
                      d={d.break > 0 
                        ? `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH} L${x},${chartHeight-focusH} Z`
                        : `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH+1} Q${x+barW},${chartHeight-focusH} ${x+barW-1},${chartHeight-focusH} L${x+1},${chartHeight-focusH} Q${x},${chartHeight-focusH} ${x},${chartHeight-focusH+1} Z`
                      }
                      fill="#3B82F6"
                    />
                  )}
                  {d.break > 0 && (
                    <Path
                      d={`M${x},${chartHeight-focusH} L${x+barW},${chartHeight-focusH} L${x+barW},${chartHeight-focusH-breakH+1} Q${x+barW},${chartHeight-focusH-breakH} ${x+barW-1},${chartHeight-focusH-breakH} L${x+1},${chartHeight-focusH-breakH} Q${x},${chartHeight-focusH-breakH} ${x},${chartHeight-focusH-breakH+1} Z`}
                      fill={palette.breakColor}
                    />
                  )}

                  {showLabel && (
                    <SvgText 
                      x={x + barW / 2} 
                      y={chartHeight + 20} 
                      fontSize="8" 
                      fill={palette.secondaryText} 
                      opacity="0.4" 
                      textAnchor="middle" 
                      fontWeight="bold"
                    >
                      {d.date.getDate()}
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
