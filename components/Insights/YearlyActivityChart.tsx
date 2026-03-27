import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { G, Text as SvgText, Line, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';

interface YearlyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function YearlyActivityChart({ history, palette }: YearlyActivityChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartHeight = 150;
  const chartInnerPadding = 48;
  const availableWidth = windowWidth - chartInnerPadding - 32;
  const yAxisWidth = 35;
  const chartAreaWidth = availableWidth - yAxisWidth;
  
  const slots = 12;
  const slotWidth = chartAreaWidth / slots;
  const barW = Math.max(12, slotWidth * 0.5); 
  const barOffset = (slotWidth - barW) / 2;

  // Current Calendar Year (Jan - Dec)
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0 = Jan, 11 = Dec
    const d = new Date(currentYear, monthIndex, 1);
    
    const start = new Date(currentYear, monthIndex, 1).getTime();
    const end = new Date(currentYear, monthIndex + 1, 1).getTime();

    // Future months in the current year
    const isFuture = start > now.getTime();

    if (isFuture) {
      return { focus: 0, break: 0, total: 0, monthName: d.toLocaleString('default', { month: 'short' }) };
    }

    const focusMins = Math.round(history
      .filter(r => r.mode === 'focus' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    const breakMins = Math.round(history
      .filter(r => r.mode === 'break' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);

    return { focus: focusMins, break: breakMins, total: focusMins + breakMins, monthName: d.toLocaleString('default', { month: 'short' }) };
  });

  const maxMins = Math.max(600, ...monthsData.map(d => d.total));
  const yLabels = [0, maxMins * 0.25, maxMins * 0.5, maxMins * 0.75, maxMins];

  // Average calculation (up to current month)
  const pastMonths = monthsData.filter((_, i) => i <= now.getMonth());
  const avgMins = pastMonths.length > 0
    ? monthsData.reduce((acc, d) => acc + d.total, 0) / pastMonths.length
    : 0;
  const avgY = chartHeight - (avgMins / maxMins) * chartHeight;

  return (
    <View style={{ marginTop: 20 }}>
      <View className="flex-row items-center mb-6">
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
          <Text style={{ color: palette.secondaryText }} className="mx-4 text-[10px] font-black opacity-40 uppercase tracking-[2px]">Yearly Activity</Text>
          <View className="h-[1px] flex-1 opacity-10 bg-white" style={{ backgroundColor: palette.secondaryText }} />
      </View>

      <View style={{ width: availableWidth, height: chartHeight + 40 }}>
        <Svg height={chartHeight + 40} width={availableWidth}>
          <G transform="translate(0, 10)">
             {/* Grid */}
             {yLabels.map((val, i) => {
              const y = chartHeight - (val / maxMins) * chartHeight;
              const isSignificant = i === 0 || i === 2 || i === 4;
              return (
                <G key={i}>
                   <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.secondaryText} strokeWidth="1" opacity="0.1" />
                   {isSignificant && (
                     <SvgText x={chartAreaWidth + 8} y={y + 3} fontSize="9" fill={palette.secondaryText} opacity="0.4" fontWeight="600">
                       {val >= 60 ? `${Math.round(val/60)}h` : `${Math.round(val)}m`}
                     </SvgText>
                   )}
                </G>
              );
            })}

            {/* Average Line */}
            {avgMins > 0 && (
              <G>
                <Line 
                  x1={0} y1={avgY} x2={chartAreaWidth} y2={avgY} 
                  stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4, 4" 
                />
                <SvgText 
                   x={chartAreaWidth + 8} y={avgY + 3} 
                   fontSize="10" fill="#4ADE80" fontWeight="900"
                >
                  avg
                </SvgText>
              </G>
            )}

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
            {monthsData.map((d, i) => {
              const x = i * slotWidth + barOffset;
              const focusH = (d.focus / maxMins) * chartHeight;
              const breakH = (d.break / maxMins) * chartHeight;

              // Show centered labels for quarters and last month
              const showLabel = i % 3 === 0 || i === slots - 1;

              return (
                <G key={i}>
                  {d.focus > 0 && (
                    <Path
                      d={d.break > 0 
                        ? `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH} L${x},${chartHeight-focusH} Z`
                        : `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH+3} Q${x+barW},${chartHeight-focusH} ${x+barW-3},${chartHeight-focusH} L${x+3},${chartHeight-focusH} Q${x},${chartHeight-focusH} ${x},${chartHeight-focusH+3} Z`
                      }
                      fill="#3B82F6"
                    />
                  )}
                  {d.break > 0 && (
                    <Path
                      d={`M${x},${chartHeight-focusH} L${x+barW},${chartHeight-focusH} L${x+barW},${chartHeight-focusH-breakH+3} Q${x+barW},${chartHeight-focusH-breakH} ${x+barW-3},${chartHeight-focusH-breakH} L${x+3},${chartHeight-focusH-breakH} Q${x},${chartHeight-focusH-breakH} ${x},${chartHeight-focusH-breakH+3} Z`}
                      fill={palette.breakColor}
                    />
                  )}

                  {/* All 12 Month Labels (Centered) */}
                  <SvgText 
                    x={x + barW / 2} 
                    y={chartHeight + 20} 
                    fontSize="7.5" 
                    fill={palette.secondaryText} 
                    opacity="0.4" 
                    textAnchor="middle" 
                    fontWeight="bold"
                  >
                    {d.monthName.substring(0, 3)}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
}
