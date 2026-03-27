import React, { useState } from 'react';
import { View, Text, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { G, Text as SvgText, Line, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface YearlyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
}

export function YearlyActivityChart({ history, palette }: YearlyActivityChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [measuredTooltipWidth, setMeasuredTooltipWidth] = useState(160);
  const windowWidth = Dimensions.get('window').width;
  const chartHeight = 150;
  const tooltipHeight = 40;
  const chartInnerPadding = 48;
  const availableWidth = windowWidth - chartInnerPadding - 32;
  const yAxisWidth = 55;
  const chartAreaWidth = availableWidth - yAxisWidth;
  
  const slots = 12;
  const slotWidth = chartAreaWidth / slots;
  const barW = Math.max(12, slotWidth * 0.5); 
  const barOffset = (slotWidth - barW) / 2;

  // Current Calendar Year (Jan - Dec)
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Optimize: Pre-filter history (This year + last year)
  const lastYearStart = new Date(currentYear - 1, 0, 1).getTime();
  const relevantHistory = history.filter(r => r.timestamp >= lastYearStart);

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

    const focusMins = Math.round(relevantHistory
      .filter(r => r.mode === 'focus' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
    const breakMins = Math.round(relevantHistory
      .filter(r => r.mode === 'break' && r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);

    return { focus: focusMins, break: breakMins, total: focusMins + breakMins, monthName: d.toLocaleString('default', { month: 'short' }) };
  });

  const maxMins = Math.max(600, ...monthsData.map(d => d.total));
  const yLabels = [0, maxMins * 0.25, maxMins * 0.5, maxMins * 0.75, maxMins];

  // --- STATS & TRENDS ---
  // Monthly Average calculation (in current year)
  const monthsElapsed = now.getMonth() + 1;
  const thisYearTotalFocusMins = monthsData.reduce((acc, d) => acc + d.focus, 0);
  const monthlyAverageYearly = thisYearTotalFocusMins / monthsElapsed;

  // Last Year Data
  const lastYearEnd = new Date(currentYear, 0, 1).getTime();
  const lastYearTotalFocusMins = relevantHistory
    .filter(r => r.mode === 'focus' && r.timestamp >= lastYearStart && r.timestamp < lastYearEnd)
    .reduce((acc, r) => acc + r.durationInSeconds, 0) / 60;
  
  const lastYearMonthlyAverage = lastYearTotalFocusMins / 12;
  let diffPercent = 0;
  if (lastYearMonthlyAverage > 0) {
    diffPercent = Math.round(((monthlyAverageYearly - lastYearMonthlyAverage) / lastYearMonthlyAverage) * 100);
  }

  const formatHours = (mins: number) => {
    if (mins < 60) return `${Math.round(mins)}m`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  const totalFocus = monthsData.reduce((acc, d) => acc + d.focus, 0);
  const totalBreak = monthsData.reduce((acc, d) => acc + d.break, 0);

  const formatMinsShort = (m: number) => {
    if (m < 1) return '0m';
    if (m < 60) return `${Math.round(m)}m`;
    const h = Math.floor(m / 60);
    const mins = Math.round(m % 60);
    return `${h}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  // Average Line (Standard line in chart)
  const pastMonths = monthsData.filter((_, i) => i <= now.getMonth());
  const avgMins = pastMonths.length > 0
    ? monthsData.reduce((acc, d) => acc + d.total, 0) / pastMonths.length
    : 0;
  const avgY = chartHeight - (avgMins / maxMins) * chartHeight;

  const handleTouch = (evt: GestureResponderEvent) => {
    const x = evt.nativeEvent.locationX;
    const index = Math.floor(x / slotWidth);
    if (index >= 0 && index < slots) {
      setActiveIndex(index);
    }
  };


  return (
    <View style={{ marginTop: 2 }}>
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text style={{ color: palette.timerText }} className="text-sm font-medium opacity-60">Monthly Average</Text>
          <Text style={{ color: palette.timerText }} className="text-4xl font-extrabold tracking-tight">
            {formatHours(monthlyAverageYearly)}
          </Text>
        </View>
        
        {diffPercent !== 0 && (
          <View className="flex-row items-center px-2 py-1 rounded-full mt-1" style={{ backgroundColor: palette.secondaryText + '15' }}>
            {diffPercent > 0 ? (
              <TrendingUp size={14} color="#4ADE80" />
            ) : (
              <TrendingDown size={14} color="#F87171" />
            )}
            <Text style={{ color: palette.timerText }} className="text-[12px] font-bold ml-1 opacity-70">
              {Math.abs(diffPercent)}% <Text className="font-normal opacity-60">from last year</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={{ width: availableWidth, height: chartHeight + tooltipHeight + 40 }} className="relative">
        {activeIndex !== null && (() => {
          if (monthsData[activeIndex].total === 0) return null;
          const barCenter = (activeIndex * slotWidth) + (slotWidth / 2);
          const tooltipLeft = Math.max(8, Math.min(availableWidth - measuredTooltipWidth - 8, barCenter - measuredTooltipWidth / 2));

          return (
            <View 
              onLayout={(e) => setMeasuredTooltipWidth(e.nativeEvent.layout.width)}
              className="absolute z-20 px-4 py-1.5 rounded-xl items-center shadow-2xl border"
              style={{ 
                left: tooltipLeft,
                top: -8,
                backgroundColor: '#111111', 
                borderColor: '#22D3EE',
                borderWidth: 1,
                minWidth: 120,
              }}
            >
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View className="items-center">
                  <Text style={{ color: '#3B82F6' }} className="text-[9px] font-bold">focus</Text>
                  <Text numberOfLines={1} className="text-[14px] font-black" style={{ color: '#F1F5F9' }}>{formatHours(monthsData[activeIndex].focus)}</Text>
                </View>
                <View className="w-[1px] h-6 bg-white/10 mx-1" />
                <View className="items-center">
                  <Text style={{ color: palette.breakColor }} className="text-[9px] font-bold">break</Text>
                  <Text numberOfLines={1} className="text-[14px] font-black" style={{ color: '#F1F5F9' }}>{formatHours(monthsData[activeIndex].break)}</Text>
                </View>
              </View>
            </View>
          );
        })()}

        <Svg height={chartHeight + tooltipHeight + 40} width={availableWidth}>
          <G transform={`translate(0, ${tooltipHeight})`}>
            {/* Dynamic Connector Line */}
            {activeIndex !== null && (() => {
              if (monthsData[activeIndex].total === 0) return null;
              const d = monthsData[activeIndex];
              const focusH = (d.focus / maxMins) * chartHeight;
              const breakH = (d.break / maxMins) * chartHeight;
              const barTopY = chartHeight - focusH - breakH;
              return (
                <Line 
                  x1={(activeIndex * slotWidth) + (slotWidth / 2)} 
                  y1={-35} 
                  x2={(activeIndex * slotWidth) + (slotWidth / 2)} 
                  y2={barTopY} 
                  stroke="#22D3EE"
                  strokeWidth="1"
                />
              );
            })()}

            {/* Grid Lines */}
            {yLabels.map((val, i) => {
              const y = chartHeight - (val / maxMins) * chartHeight;
              const isSignificant = i === 0 || i === 2 || i === 4;
              return (
                <G key={i}>
                   <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.timerText} strokeWidth="1" opacity="0.1" />
                   {isSignificant && (
                     <SvgText x={chartAreaWidth + 8} y={y + 3} fontSize="9" fill={palette.timerText} opacity="0.7" fontWeight="600">
                       {Math.round(val)}m
                     </SvgText>
                   )}
                </G>
              );
            })}

            {/* Average Line (Behind) */}
            {avgMins > 0 && (
               <G>
                  <Line 
                    x1={0} y1={avgY} x2={chartAreaWidth} y2={avgY} 
                    stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4 3" 
                  />
               </G>
            )}

            {/* Vertical Dividers */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const x = p * chartAreaWidth;
              return (
                <Line key={i} x1={x} y1={0} x2={x} y2={chartHeight} stroke={palette.timerText} strokeWidth="1" opacity="0.12" />
              );
            })}

            {/* Bars */}
            {monthsData.map((d, i) => {
              const isActive = activeIndex === i;
              const x = i * slotWidth + barOffset;
              const focusH = (d.focus / maxMins) * chartHeight;
              const breakH = (d.break / maxMins) * chartHeight;
              const showLabel = i % 2 === 0;

              return (
                <G key={i}>
                  {d.focus > 0 && (
                    <Path
                      d={d.break > 0 
                        ? `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${Math.floor(chartHeight-focusH)} L${x},${Math.floor(chartHeight-focusH)} Z`
                        : `M${x},${chartHeight} L${x+barW},${chartHeight} L${x+barW},${chartHeight-focusH+2} Q${x+barW},${chartHeight-focusH} ${x+barW-2},${chartHeight-focusH} L${x+2},${chartHeight-focusH} Q${x},${chartHeight-focusH} ${x},${chartHeight-focusH+2} Z`
                      }
                      fill={isActive ? "#22D3EE" : "#3B82F6"}
                    />
                  )}
                  {d.break > 0 && (
                    <Path
                      d={`M${x},${Math.floor(chartHeight-focusH)} L${x+barW},${Math.floor(chartHeight-focusH)} L${x+barW},${chartHeight-focusH-breakH+2} Q${x+barW},${chartHeight-focusH-breakH} ${x+barW-2},${chartHeight-focusH-breakH} L${x+2},${chartHeight-focusH-breakH} Q${x},${chartHeight-focusH-breakH} ${x},${chartHeight-focusH-breakH+2} Z`}
                      fill={isActive ? "#22D3EE" : "#FF9F0A"}
                    />
                  )}

                  {showLabel && (
                    <SvgText x={x + barW / 2} y={chartHeight + 20} fontSize="8" fill={palette.timerText} opacity="0.7" textAnchor="middle" fontWeight="bold">
                      {d.monthName}
                    </SvgText>
                  )}
                </G>
              );
            })}
            
            {/* Average Label (On Top) */}
             {avgMins > 0 && (
               <SvgText x={chartAreaWidth + 8} y={avgY + 3} fontSize="10" fill="#4ADE80" fontWeight="900">avg</SvgText>
             )}
          </G>
        </Svg>
        
        <View 
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
          onResponderRelease={() => setActiveIndex(null)}
          onResponderTerminate={() => setActiveIndex(null)}
          style={{ position: 'absolute', top: tooltipHeight, left: 0, width: chartAreaWidth, height: chartHeight, backgroundColor: 'transparent', zIndex: 5 }}
        />
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-6" style={{ gap: 32 }}>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
          <Text style={{ color: palette.timerText }} className="text-[12px] opacity-70">
            Total Focus <Text className="font-black">{formatMinsShort(totalFocus)}</Text>
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: "#FF9F0A" }} />
          <Text style={{ color: palette.timerText }} className="text-[12px] opacity-70">
            Total Break <Text className="font-black">{formatMinsShort(totalBreak)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
