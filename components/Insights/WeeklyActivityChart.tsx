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
}

export function WeeklyActivityChart({ history, palette, selectedDayIndex, onSelectDay, hideTooltip }: WeeklyActivityChartProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);
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
  const slots = 7; // For weekly chart, 7 days
  const slotWidth = chartWidth / slots;
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

  // DATA FETCHING: Clean aggregation with overlap splitting
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(displayMondayOffset);
    d.setDate(displayMondayOffset.getDate() + i);
    const start = d.getTime();
    const end = start + 86400000;
    
    let focusSecs = 0;
    let breakSecs = 0;

    history.forEach(r => {
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
  
  const dailyAverage = Math.round(thisWeekTotal / 7);
  
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
    
    // Only allow selection if the day has data (focus or break > 0)
    if (daysData[clampedIndex].total > 0) {
      if (onSelectDay) {
        onSelectDay(clampedIndex);
      } else {
        setInternalActiveIndex(clampedIndex);
      }
    }
  };

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
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

      <View style={{ width: availableWidth, height: chartHeight + tooltipHeight + 40 }} className="relative">
        {activeIdx !== null && !hideTooltip && (() => {
          const barCenter = (activeIdx * slotWidth) + (slotWidth / 2);
          const tooltipWidth = 140;
          const tooltipLeft = Math.max(8, Math.min(availableWidth - tooltipWidth - 8, barCenter - tooltipWidth / 2));

          return (
            <View 
              className="absolute z-10 px-3 py-1.5 rounded-xl items-center shadow-2xl border"
              style={{ 
                left: tooltipLeft, 
                top: -8, 
                backgroundColor: '#111111', 
                borderColor: '#22D3EE',
                borderWidth: 1,
                width: tooltipWidth,
                alignSelf: 'flex-start',
              }}
            >
              <View className="flex-row items-center" style={{ gap: 10 }}>
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
          );
        })()}

        <Svg height={chartHeight + tooltipHeight + 40} width={availableWidth}>
          <G transform={`translate(0, ${tooltipHeight})`}>
            {/* Dynamic Connector Line */}
            {activeIdx !== null && !hideTooltip && (() => {
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
                  <Line x1={0} y1={y} x2={chartWidth} y2={y} stroke={palette.timerText} strokeWidth="1" opacity="0.1" />
                  {shouldShowLabel && (
                    <SvgText x={chartWidth + 8} y={y + 4} fontSize="10" fill={palette.timerText} opacity="0.7" fontWeight="600">
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

            {/* Bars (Inactive Only) */}
            {daysData.map((d, i) => {
              if (activeIdx === i) return null;
              const focusH = (d.focus / maxMinutes) * chartHeight;
              const breakH = (d.break / maxMinutes) * chartHeight;
              const x = i * slotWidth + barWidthHorizontalOffset;
              const isToday = i === today.getDay(); 
              const focusColor = "#3B82F6";
              const breakColor = palette.breakColor;

              return (
                <G key={i}>
                  {d.focus > 0 && (
                    <Path
                      d={d.break > 0 
                        ? `M${x},${chartHeight} L${x+barWidth},${chartHeight} L${x+barWidth},${Math.floor(chartHeight-focusH)} L${x},${Math.floor(chartHeight-focusH)} Z`
                        : `M${x},${chartHeight} L${x+barWidth},${chartHeight} L${x+barWidth},${chartHeight-focusH+2} Q${x+barWidth},${chartHeight-focusH} ${x+barWidth-2},${chartHeight-focusH} L${x+2},${chartHeight-focusH} Q${x},${chartHeight-focusH} ${x},${chartHeight-focusH+2} Z`
                      }
                      fill={focusColor}
                    />
                  )}
                  {d.break > 0 && (
                    <Path
                      d={`M${x},${Math.floor(chartHeight-focusH)} L${x+barWidth},${Math.floor(chartHeight-focusH)} L${x+barWidth},${chartHeight-focusH-breakH+2} Q${x+barWidth},${chartHeight-focusH-breakH} ${x+barWidth-2},${chartHeight-focusH-breakH} L${x+2},${chartHeight-focusH-breakH} Q${x},${chartHeight-focusH-breakH} ${x},${chartHeight-focusH-breakH+2} Z`}
                      fill={breakColor}
                    />
                  )}
                  <SvgText
                    x={x + barWidth / 2} y={chartHeight + 25}
                    fontSize="12" fill={palette.timerText}
                    textAnchor="middle" fontWeight={isToday ? "900" : "500"}
                    opacity={isToday ? 1 : 0.3}
                  >
                    {dayNames[i]}
                  </SvgText>
                </G>
              );
            })}

            {/* AVERAGE LINE (Behind Selection) */}
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

            {/* Active/Selected Bar (On Top of Average Line) */}
            {activeIdx !== null && (() => {
              const i = activeIdx;
              const d = daysData[i];
              const focusH = (d.focus / maxMinutes) * chartHeight;
              const breakH = (d.break / maxMinutes) * chartHeight;
              const x = i * slotWidth + barWidthHorizontalOffset;
              const isToday = i === today.getDay();
              
              return (
                <G key={i}>
                  {(d.focus > 0 || d.break > 0) && (
                    <Path
                      d={`M${x},${chartHeight} L${x+barWidth},${chartHeight} L${x+barWidth},${chartHeight-(focusH+breakH)+2} Q${x+barWidth},${chartHeight-(focusH+breakH)} ${x+barWidth-2},${chartHeight-(focusH+breakH)} L${x+2},${chartHeight-(focusH+breakH)} Q${x},${chartHeight-(focusH+breakH)} ${x},${chartHeight-(focusH+breakH)+2} Z`}
                      fill="#22D3EE"
                    />
                  )}
                  <SvgText
                    x={x + barWidth / 2} y={chartHeight + 25}
                    fontSize="12" fill={palette.timerText}
                    textAnchor="middle" fontWeight="900"
                    opacity={1}
                  >
                    {dayNames[i]}
                  </SvgText>
                </G>
              );
            })()}
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
          style={{ position: 'absolute', top: tooltipHeight, left: 0, width: chartWidth, height: chartHeight, backgroundColor: 'transparent', zIndex: 5 }}
        />
      </View>
    </View>
  );
}
