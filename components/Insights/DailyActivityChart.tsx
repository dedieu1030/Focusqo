import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { SessionRecord } from '../../store/useTimerStore';
import { ColorPalette } from '../../constants/Palettes';
import { TrendUp, TrendDown } from 'iconsax-react-native';

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
  
  const baseDate = date || new Date();
  const startOfSelectedDay = new Date(baseDate).setHours(0, 0, 0, 0);
  const endOfSelectedDay = startOfSelectedDay + 86400000;

  // Optimize: Pre-filter history for the selected day
  const relevantDayHistory = history.filter(r => 
    r.timestamp + (r.durationInSeconds * 1000) > startOfSelectedDay && 
    r.timestamp < endOfSelectedDay
  );

  // Stats: Overall Daily Average (Focus only)
  const uniqueDays = new Set(history.map(r => new Date(r.timestamp).toDateString())).size;
  const totalHistoricalFocusSecs = history.filter(r => r.mode === 'focus').reduce((acc, r) => acc + r.durationInSeconds, 0);
  const historicalDailyAverageMins = uniqueDays > 0 ? (totalHistoricalFocusSecs / 60) / uniqueDays : 0;
  
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const start = startOfSelectedDay + hour * 3600000;
    const end = start + 3600000;
    
    let focusMins = 0;
    let breakMins = 0;

    // Direct attribution by start time (much more robust)
    relevantDayHistory.forEach(r => {
      if (r.timestamp >= start && r.timestamp < end) {
        if (r.mode === 'focus') focusMins += r.durationInSeconds / 60;
        else breakMins += r.durationInSeconds / 60;
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

  const totalFocus = hourlyData.reduce((acc, d) => acc + d.focus, 0);
  const totalBreak = hourlyData.reduce((acc, d) => acc + d.break, 0);

  // Trend logic (vs Historical Average)
  let diffPercent = 0;
  if (historicalDailyAverageMins > 0) {
    diffPercent = Math.round(((totalFocus - historicalDailyAverageMins) / historicalDailyAverageMins) * 100);
  }

  const formatHours = (mins: number) => {
    if (mins < 60) return `${Math.round(mins)}m`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  const formatMinsShort = (m: number) => {
    if (m < 1) return '0m';
    if (m < 60) return `${Math.round(m)}m`;
    const h = Math.floor(m / 60);
    const mins = Math.round(m % 60);
    return `${h}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  return (
    <View style={{ marginTop: 10 }}>
       <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text style={{ color: palette.timerText }} className="text-sm font-medium opacity-60">Total Focus Today</Text>
          <Text style={{ color: palette.timerText }} className="text-4xl font-extrabold tracking-tight">
            {formatHours(totalFocus)}
          </Text>
        </View>
        
        {diffPercent !== 0 && (
          <View className="flex-row items-center px-2 py-1 rounded-full mt-1" style={{ backgroundColor: palette.secondaryText + '15' }}>
            {diffPercent > 0 ? (
              <TrendUp size={14} color="#4ADE80" variant="Linear" />
            ) : (
              <TrendDown size={14} color="#F87171" variant="Linear" />
            )}
            <Text style={{ color: palette.timerText }} className="text-[12px] font-bold ml-1 opacity-70">
              {Math.abs(diffPercent)}% <Text className="font-normal opacity-60">vs average</Text>
            </Text>
          </View>
        )}
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
                     <SvgText x={chartAreaWidth + 4} y={y + 3} fontSize="9" fill={palette.timerText} opacity="0.7" fontWeight="600">
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
                      fill={palette.focusColor}
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
      <View className="flex-row items-center justify-center mt-6" style={{ gap: 32 }}>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: palette.focusColor }} />
          <Text style={{ color: palette.timerText }} className="text-[12px] opacity-70">
            Total Focus <Text className="font-black">{formatMinsShort(totalFocus)}</Text>
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: palette.breakColor }} />
          <Text style={{ color: palette.timerText }} className="text-[12px] opacity-70">
            Total Break <Text className="font-black">{formatMinsShort(totalBreak)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
