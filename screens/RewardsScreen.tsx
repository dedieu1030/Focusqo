import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions 
} from 'react-native';
import Animated, { 
  useSharedValue, useAnimatedStyle, 
  withSpring, withDelay, withSequence, withTiming,
  FadeInUp, FadeIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft2, Lock1, Cup } from 'iconsax-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTimerStore } from '../store/useTimerStore';
import { useAchievementsStore, ACHIEVEMENTS_CATALOG } from '../store/useAchievementsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const IMAGE_SIZE = 120;

// Map achievement IDs to their reward images
const REWARD_IMAGES: Record<number, any> = {
  1: require('../assets/rewards/guardian_1.png'),
};

interface RewardsScreenProps {
  onBack: () => void;
}

// Curved connector component
function CurvedConnector({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  const w = CARD_WIDTH * 0.5;
  const h = 48;
  
  const path = direction === 'right' 
    ? `M ${w * 0.3} 0 C ${w * 0.3} ${h * 0.6}, ${w * 0.7} ${h * 0.4}, ${w * 0.7} ${h}`
    : `M ${w * 0.7} 0 C ${w * 0.7} ${h * 0.6}, ${w * 0.3} ${h * 0.4}, ${w * 0.3} ${h}`;

  return (
    <View style={{ width: w, height: h, alignSelf: 'center' }}>
      <Svg width={w} height={h}>
        <Path
          d={path}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray="6,4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Single achievement node
function AchievementNode({ 
  achievement, 
  isUnlocked, 
  eraColor, 
  index,
  palette,
}: { 
  achievement: typeof ACHIEVEMENTS_CATALOG[0];
  isUnlocked: boolean;
  eraColor: string;
  index: number;
  palette: any;
}) {
  const hasImage = REWARD_IMAGES[achievement.id];
  const animDelay = index * 80;

  if (isUnlocked) {
    return (
      <Animated.View 
        entering={FadeInUp.delay(animDelay).springify().damping(14)}
        style={[styles.nodeCard, { backgroundColor: palette.timerBlock }]}
      >
        {/* Image or Icon */}
        <View style={[styles.nodeImageContainer, { borderColor: eraColor + '40' }]}>
          {hasImage ? (
            <Image 
              source={REWARD_IMAGES[achievement.id]} 
              style={styles.nodeImageFull} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.nodeIconFallback, { backgroundColor: eraColor + '15' }]}>
              <Cup size={36} color={eraColor} variant="Bold" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.nodeInfo}>
          <View style={[styles.unlockedBadge, { backgroundColor: eraColor + '20' }]}>
            <Text style={[styles.unlockedText, { color: eraColor }]}>Unlocked</Text>
          </View>
          <Text style={[styles.nodeName, { color: palette.timerText }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.nodeDesc, { color: palette.timerText }]}>
            {achievement.description}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Locked state
  return (
    <Animated.View 
      entering={FadeIn.delay(animDelay).duration(300)}
      style={[styles.lockedNode, { backgroundColor: palette.secondaryText + '08' }]}
    >
      <View style={[styles.lockedCircle, { backgroundColor: palette.secondaryText + '10' }]}>
        <Lock1 size={20} color={palette.secondaryText + '40'} variant="Bold" />
      </View>
      <View style={styles.lockedInfo}>
        <Text style={[styles.lockedName, { color: palette.secondaryText + '60' }]}>
          {achievement.title}
        </Text>
        <Text style={[styles.lockedDesc, { color: palette.secondaryText + '40' }]} numberOfLines={1}>
          {achievement.description}
        </Text>
      </View>
    </Animated.View>
  );
}

export function RewardsScreen({ onBack }: RewardsScreenProps) {
  const { palette } = useThemeStore();
  const { history, labels } = useTimerStore();
  const { unlockedIds, checkAchievements } = useAchievementsStore();

  useEffect(() => {
    checkAchievements(history, labels.length);
  }, [history, labels]);

  const eraColors: Record<string, string> = {
    wisp: '#66D9EF',
    guardian: '#E6A756',
    sage: '#B07CC6',
    deity: '#FF6B8A',
  };

  const eraNames: Record<string, string> = {
    wisp: 'The Wisp Era',
    guardian: 'The Guardian Era', 
    sage: 'The Sage Era',
    deity: 'The Deity Era',
  };

  const totalUnlocked = unlockedIds.length;
  const progressPercent = Math.round((totalUnlocked / 50) * 100);

  const eras = ['wisp', 'guardian', 'sage', 'deity'] as const;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft2 size={24} color={palette.primaryText} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>Journey</Text>
        <View style={styles.headerRight}>
          <Cup size={20} color={palette.focusColor} variant="Bold" />
          <Text style={[styles.headerCount, { color: palette.focusColor }]}>{totalUnlocked}/50</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: palette.timerBlock }]}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: palette.timerText }]}>
            Yearly Progress
          </Text>
          <Text style={[styles.progressPercent, { color: palette.timerText }]}>
            {progressPercent}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: palette.timerText + '15' }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.max(progressPercent, 2)}%`,
                backgroundColor: palette.focusColor,
              }
            ]} 
          />
        </View>
      </View>

      {/* Achievement Journey */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {eras.map((era) => {
          const eraAchievements = ACHIEVEMENTS_CATALOG.filter(a => a.era === era);
          const eraColor = eraColors[era];
          const eraUnlocked = eraAchievements.filter(a => unlockedIds.includes(a.id)).length;
          
          return (
            <View key={era} style={styles.eraSection}>
              {/* Era Header */}
              <View style={styles.eraHeader}>
                <View style={[styles.eraDot, { backgroundColor: eraColor }]} />
                <Text style={[styles.eraTitle, { color: palette.primaryText }]}>
                  {eraNames[era]}
                </Text>
                <Text style={[styles.eraCount, { color: palette.secondaryText }]}>
                  {eraUnlocked}/{eraAchievements.length}
                </Text>
              </View>

              {/* Achievement Nodes */}
              {eraAchievements.map((achievement, index) => {
                const isUnlocked = unlockedIds.includes(achievement.id);
                const nextIsUnlocked = index < eraAchievements.length - 1 
                  && unlockedIds.includes(eraAchievements[index + 1].id);
                const showConnector = index < eraAchievements.length - 1;
                const connectorColor = isUnlocked && nextIsUnlocked 
                  ? eraColor 
                  : palette.secondaryText + '20';
                const direction = index % 2 === 0 ? 'right' : 'left';

                return (
                  <View key={achievement.id}>
                    <AchievementNode
                      achievement={achievement}
                      isUnlocked={isUnlocked}
                      eraColor={eraColor}
                      index={index}
                      palette={palette}
                    />
                    {showConnector && (
                      <CurvedConnector color={connectorColor} direction={direction} />
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Final message */}
        <View style={styles.finalMessage}>
          <Text style={styles.finalEmoji}>🌟</Text>
          <Text style={[styles.finalText, { color: palette.secondaryText }]}>
            The journey of a year begins with a single session.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressContainer: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 60,
  },
  eraSection: {
    marginBottom: 24,
  },
  eraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  eraDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eraTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  eraCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Unlocked Card --
  nodeCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nodeImageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  nodeImageFull: {
    width: '100%',
    height: '100%',
  },
  nodeIconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  nodeInfo: {
    flex: 1,
    gap: 4,
  },
  unlockedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 2,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nodeName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  nodeDesc: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.5,
    lineHeight: 18,
  },

  // -- Locked Node --
  lockedNode: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockedCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedInfo: {
    flex: 1,
  },
  lockedName: {
    fontSize: 15,
    fontWeight: '600',
  },
  lockedDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // -- Final --
  finalMessage: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  finalEmoji: {
    fontSize: 36,
  },
  finalText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
