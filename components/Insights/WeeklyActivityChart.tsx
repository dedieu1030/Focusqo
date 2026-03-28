import React, { useState } from 'react';
import { View, Text, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, LinearGradient, Stop, Line, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface WeeklyActivityChartProps {
  history: SessionRecord[];
  palette: ColorPalette;
  selectedDayIndex?: number | null;
  onSelectDay?: (index: number) => void;
  hideTooltip?: boolean;
  hideLegend?: boolean;
}

export function WeeklyActivityChart({ history, palette, selectedDayIndex, onSelectDay, hideTooltip, hideLegend }: WeeklyActivityChartProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);
  const windowWidth = Dimensions.get('window').width;
  
  // Layout constants
  const chartHeight = 160;
  const effectiveTooltipHeight = hideTooltip ? 10 : 40; 
  const barWidth = 22;
  const yAxisWidth = 35;
  
  // Spacing
  const chartInnerPadding = 48; 
  const availableWidth = windowWidth - chartInnerPadding - 32; 
  const chartAreaWidth = availableWidth - yAxisWidth; 
  const slots = 7; // For weekly chart, 7 days
  const slotWidth = chartAreaWidth / slots;
  const barWidthHorizontalOffset = (slotWidth - barWidth) / 2;

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

  const displayMondayOffset = new Date(mondayOffset);
  displayMondayOffset.setDate(mondayOffset.getDate() - 1); 

  // Optimize: Pre-filter history once
  const weekStartTime = mondayOffset.getTime();
  const weekEndTime = weekStartTime + 7 * 86400000;
  const prevWeekStartTime = prevMonday.getTime();
  const relevantHistory = history.filter(r => r.timestamp >= prevWeekStartTime && r.timestamp < weekEndTime);

  const getWeekMinutes = (start: Date, end: Date) => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const weekSessions = relevantHistory.filter(r => 
      r.mode === 'focus' && 
      r.timestamp >= startTime && 
      r.timestamp <= endTime
    );
    return Math.round(weekSessions.reduce((acc, r) => acc + r.durationInSeconds, 0) / 60);
  };

  // DATA FETCHING: Clean aggregation with overlap splitting
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(displayMondayOffset);
    d.setDate(displayMondayOffset.getDate() + i);
    const start = d.getTime();
    const end = start + 86400000;
    
    let focusSecs = 0;
    let breakSecs = 0;

    relevantHistory.forEach(r => {
      const sessionStart = r.timestamp;
      const sessionEnd = r.timestamp + r.durationInSeconds * 1000;

      const overlapStart = Math.max(start, sessionStart);
      const overlapEnd = Math.min(end, sessionEnd);

      if (overlapEnd > overlapStart) {
        const durationSec = (overlapEnd - overlapStart) / 1000;
        if (r.mode === 'focus') focusSecs += durationSec;
        else breakSecs += durationSec;
      }
    });

    return { 
      focus: Math.round(focusSecs / 60), 
      break: Math.round(breakSecs / 60),
      total: Math.round((focusSecs + breakSecs) / 60)
    };
  });

  const thisWeekTotal = daysData.reduce((acc, d) => acc + d.focus, 0);
  const lastWeekTotal = getWeekMinutes(prevMonday, prevSunday) || 180;
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // LOGIC FIX: Use elapsed days for average
  const elapsedDaysInWeek = today.getDay() === 0 ? 7 : today.getDay();
  const dailyAverage = Math.round(thisWeekTotal / elapsedDaysInWeek);
  
  let diffPercent = 0;
  if (lastWeekTotal > 0) {
    diffPercent = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
  }

  // DYNAMIC SCALING with 20% headroom to prevent overflow
  const trueMax = Math.max(...daysData.map(d => d.total));
  const maxMinutes = Math.max(trueMax * 1.2, 30); 

  const yLabels = [0, Math.round(maxMinutes * 0.25), Math.round(maxMinutes * 0.5), Math.round(maxMinutes * 0.75), Math.round(maxMinutes)];

  const handleTouch = (evt: GestureResponderEvent) => {
    const x = evt.nativeEvent.locationX;
    const index = Math.floor(x / slotWidth);
    const clampedIndex = Math.max(0, Math.min(6, index));
    
    if (onSelectDay) {
      onSelectDay(clampedIndex);
    } else {
      setInternalActiveIndex(clampedIndex);
    }
  };

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const totalFocus = daysData.reduce((acc, d) => acc + d.focus, 0);
  const totalBreak = daysData.reduce((acc, d) => acc + d.break, 0);

  const formatMinsShort = (m: number) => {
    if (m < 1) return '0m';
    if (m < 60) return `${Math.round(m)}m`;
    const h = Math.floor(m / 60);
    const mins = Math.round(m % 60);
    return `${h}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const activeIdx = onSelectDay 
    ? (selectedDayIndex ?? null) 
    : (internalActiveIndex ?? null);

  return (
    <View className="mt-2">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text style={{ color: palette.timerText }} className="text-sm font-medium opacity-70">Daily Average</Text>
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
            <Text style={{ color: palette.timerText }} className="text-[12px] font-bold ml-1 opacity-70">
              {Math.abs(diffPercent)}% <Text className="font-normal opacity-60">from last week</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={{ width: availableWidth, height: chartHeight + effectiveTooltipHeight + 40 }} className="relative">
        {activeIdx !== null && !hideTooltip && (() => {
          if (daysData[activeIdx].total === 0) return null;
          const barCenter = (activeIdx * slotWidth) + (slotWidth / 2);
          
          // 3-Zone alignment to prevent overflow over Y-axis labels
          let wrapperStyle: any;
          if (activeIdx <= 1) {
            wrapperStyle = { left: 0, width: chartAreaWidth, alignItems: 'flex-start' };
          } else if (activeIdx >= 5) {
            wrapperStyle = { left: 0, width: chartAreaWidth, alignItems: 'flex-end' };
          } else {
            // Middle bars: center on bar, but with a safe container to prevent jitter
            wrapperStyle = { left: barCenter - 150, width: 300, alignItems: 'center' };
          }

          return (
            <View 
              key={activeIdx}
              pointerEvents="none"
              className="absolute z-20"
              style={{ 
                ...wrapperStyle,
                top: -8,
              }}
            >
              <View 
                className="px-4 py-1.5 rounded-xl items-center shadow-2xl border"
                style={{ 
                  backgroundColor: '#111111', 
                  borderColor: '#22D3EE',
                  borderWidth: 1,
                  minWidth: 120,
                }}
              >
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="items-center">
                    <Text style={{ color: '#3B82F6' }} className="text-[9px] font-bold">focus</Text>
                    <Text numberOfLines={1} className="text-[14px] font-black" style={{ color: '#F1F5F9' }}>{formatHours(daysData[activeIdx].focus)}</Text>
                  </View>
                  <View className="w-[1px] h-6 bg-white/10 mx-1" />
                  <View className="items-center">
                    <Text style={{ color: palette.breakColor }} className="text-[9px] font-bold">break</Text>
                    <Text numberOfLines={1} className="text-[14px] font-black" style={{ color: '#F1F5F9' }}>{formatHours(daysData[activeIdx].break)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        <Svg height={chartHeight + effectiveTooltipHeight + 40} width={availableWidth}>
          <G transform={`translate(0, ${effectiveTooltipHeight})`}>
            {/* Dynamic Connector Line */}
            {activeIdx !== null && !hideTooltip && (() => {
              if (daysData[activeIdx].total === 0) return null;
              const d = daysData[activeIdx];
              const focusH = (d.focus / maxMinutes) * chartHeight;
              const breakH = (d.break / maxMinutes) * chartHeight;
              const barTopY = chartHeight - focusH - breakH;
              return (
                <Line 
                  x1={(activeIdx * slotWidth) + (slotWidth / 2)} 
                  y1={-35} 
                  x2={(activeIdx * slotWidth) + (slotWidth / 2)} 
                  y2={barTopY} 
                  stroke="#22D3EE"
                  strokeWidth="1"
                  opacity="1"
                />
              );
            })()}
            {/* HORIZONTAL GRID LINES */}
            {yLabels.map((val, idx) => {
              const y = chartHeight - (val / maxMinutes) * chartHeight;
              const shouldShowLabel = idx === 0 || idx === 2 || idx === 4;
              return (
                <G key={val}>
                  <Line x1={0} y1={y} x2={chartAreaWidth} y2={y} stroke={palette.timerText} strokeWidth="1" opacity="0.1" />
                  {shouldShowLabel && (
                    <SvgText x={chartAreaWidth + 4} y={y + 4} fontSize="10" fill={palette.timerText} opacity="0.7" fontWeight="600">
                      {val === 0 ? '0' : (val < 60 ? `${val}m` : `${Math.floor(val/60)}h`)}
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* VERTICAL DIVIDER LINES (Superimposed) */}
            {Array.from({ length: slots + 1 }).map((_, i) => { 
              const x = i * slotWidth;
              return (
                <Line 
                  key={i}
                  x1={x} y1={0}
                  x2={x} y2={chartHeight}
                  stroke={palette.timerText} strokeWidth="1" opacity="0.08"
                />
              );
            })}

            {/* Bars */}
            {daysData.map((d, i) => {
              const focusH = (d.focus / maxMinutes) * chartHeight;
              const breakH = (d.break / maxMinutes) * chartHeight;
              const x = i * slotWidth + barWidthHorizontalOffset;
              const isToday = i === today.getDay(); 
              const isActive = activeIdx === i;
              const isHighlighted = isActive && d.total > 0;
              
              const focusColor = isHighlighted ? "#22D3EE" : "#3B82F6";
              const breakColor = isHighlighted ? "#22D3EE" : "#FF9F0A";

              return (
                <G key={i}>
                  {d.focus > 0 && (
                    <Path
                      d={d.break > 0 
                        ? `M${x},${chartHeight} L${x+barWidth},${chartHeight} L${x+barWidth},${Math.floor(chartHeight-focusH)} L${x},${Math.floor(chartHeight-focusH)} Z`
                        : `M${x},${chartHeight} L${x+barWidth},${chartHeight} L${x+barWidth},${Math.floor(chartHeight-focusH)+2} Q${x+barWidth},${Math.floor(chartHeight-focusH)} ${x+barWidth-2},${Math.floor(chartHeight-focusH)} L${x+2},${Math.floor(chartHeight-focusH)} Q${x},${Math.floor(chartHeight-focusH)} ${x},${Math.floor(chartHeight-focusH)+2} Z`
                      }
                      fill={focusColor}
                    />
                  )}
                  {d.break > 0 && (
                    <Path
                      d={`M${x},${Math.floor(chartHeight-focusH)} L${x+barWidth},${Math.floor(chartHeight-focusH)} L${x+barWidth},${Math.floor(chartHeight-focusH-breakH)+2} Q${x+barWidth},${Math.floor(chartHeight-focusH-breakH)} ${x+barWidth-2},${Math.floor(chartHeight-focusH-breakH)} L${x+2},${Math.floor(chartHeight-focusH-breakH)} Q${x},${Math.floor(chartHeight-focusH-breakH)} ${x},${Math.floor(chartHeight-focusH-breakH)+2} Z`}
                      fill={breakColor}
                    />
                  )}
                  <SvgText
                    x={x + barWidth / 2} y={chartHeight + 25}
                    fontSize="12" fill={palette.timerText}
                    textAnchor="middle" fontWeight={isToday ? "900" : (isHighlighted ? "900" : "500")}
                    opacity={isToday ? 1 : (isHighlighted ? 1 : 0.3)}
                  >
                    {dayNames[i]}
                  </SvgText>
                </G>
              );
            })}

            {/* AVERAGE LINE (In front of bars) */}
            {dailyAverage > 0 && dailyAverage <= maxMinutes && (
               <G>
                  <Line 
                    x1={0} y1={chartHeight - (dailyAverage / maxMinutes) * chartHeight} 
                    x2={chartAreaWidth} y2={chartHeight - (dailyAverage / maxMinutes) * chartHeight} 
                    stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4 3" 
                  />
                  <SvgText x={chartAreaWidth + 4} y={chartHeight - (dailyAverage / maxMinutes) * chartHeight + 4} fontSize="10" fill="#4ADE80" fontWeight="bold">avg</SvgText>
               </G>
            )}
          </G>
        </Svg>

        <View 
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
          onResponderRelease={() => {
            if (!onSelectDay) setInternalActiveIndex(null);
          }}
          onResponderTerminate={() => {
            if (!onSelectDay) setInternalActiveIndex(null);
          }}
          style={{ position: 'absolute', top: effectiveTooltipHeight, left: 0, width: chartAreaWidth, height: chartHeight, backgroundColor: 'transparent', zIndex: 5 }}
        />
      </View>

      {!hideLegend && (
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
      )}
    </View>
  );
}
