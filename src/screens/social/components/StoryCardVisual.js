import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useC } from '../../../contexts/ThemeContext';
import { STEP } from '../../../themes/tokens';

export function StoryCardVisual({ id }) {
  const C = useC();
  
  if (!id) return null;

  // Ortak SVG stili
  const width = '100%';
  const height = 90;

  switch (id) {
    case 'study_day':
    case 'weekly_route':
      return (
        <Svg width={width} height={height} viewBox="0 0 272 92" style={styles.svg}>
          <Path d="M 0 70 C 40 68 80 50 120 40 C 180 25 220 15 272 5" fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={40} cy={66} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.5} />
          <Circle cx={100} cy={46} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.5} />
          <Circle cx={180} cy={25} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.5} />
          <Circle cx={270} cy={6} r={8} fill={C.accent} />
        </Svg>
      );
    
    case 'questions':
    case 'rhythm':
      // Bar chart
      const bars = id === 'questions' 
        ? [34, 52, 28, 66, 44, 72, 58] 
        : [20, 40, 35, 60, 45, 80, 50, 65, 40, 55, 75, 45];
      const max = Math.max(...bars);
      const barWidth = id === 'questions' ? 12 : 6;
      const gap = id === 'questions' ? 24 : 12;
      return (
        <Svg width={width} height={height} viewBox="0 0 272 92" style={styles.svg}>
          {bars.map((val, i) => {
            const h = (val / max) * 70;
            const isPeak = val === max || val > max * 0.8;
            return (
              <Rect 
                key={i} 
                x={i * gap} 
                y={92 - h} 
                width={barWidth} 
                height={h} 
                rx={barWidth / 2} 
                fill={isPeak ? C.accent : C.elev} 
              />
            );
          })}
        </Svg>
      );

    case 'stop':
    case 'next_stop':
      return (
        <Svg width={width} height={height} viewBox="0 0 272 92" style={styles.svg}>
          <Path d="M 0 70 C 40 68 80 50 120 40" fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" />
          <Path d="M 120 40 C 180 25 220 15 272 5" fill="none" stroke={C.border} strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />
          <Circle cx={120} cy={40} r={7} fill={C.accent} />
          <Circle cx={270} cy={6} r={5} fill={C.bg} stroke={C.border} strokeWidth={2.5} />
        </Svg>
      );

    case 'comeback':
      return (
        <Svg width={width} height={height} viewBox="0 0 272 92" style={styles.svg}>
          <Path d="M 0 85 C 40 85 80 85 120 85" fill="none" stroke={C.text5} strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />
          <Path d="M 120 85 C 160 85 180 50 272 10" fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={270} cy={11} r={8} fill={C.accent} />
        </Svg>
      );

    case 'route_move':
      return (
        <Svg width={width} height={height} viewBox="0 0 272 92" style={styles.svg}>
          <Path d="M 0 70 C 40 65 80 60 120 50" fill="none" stroke={C.text5} strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />
          <Path d="M 120 50 C 160 40 200 15 272 5" fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={270} cy={6} r={8} fill={C.accent} />
        </Svg>
      );
      
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  svg: {
    marginTop: STEP.s4,
    marginBottom: STEP.s2,
  }
});
