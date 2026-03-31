import React, { useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions 
} from 'react-native';
import { ArrowLeft2, Lock1, Cup } from 'iconsax-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTimerStore } from '../store/useTimerStore';
import { useAchievementsStore, ACHIEVEMENTS_CATALOG } from '../store/useAchievementsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 80;
const PATH_WIDTH = SCREEN_WIDTH - 48;

// Map achievement IDs to their reward images
// For now only guardian_1 has an image; rest will show a placeholder
const REWARD_IMAGES: Record<number, any> = {
  1: require('../assets/rewards/guardian_1.png'),
};

interface RewardsScreenProps {
  onBack: () => void;
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

  // Group achievements by era
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

      {/* Achievement Path */}
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

              {/* Achievement Nodes — S-curve layout */}
              <View style={styles.nodesContainer}>
                {eraAchievements.map((achievement, index) => {
                  const isUnlocked = unlockedIds.includes(achievement.id);
                  const hasImage = REWARD_IMAGES[achievement.id];
                  
                  // S-curve: alternate left and right
                  const isLeft = index % 2 === 0;
                  const nodeOffset = isLeft ? 0 : PATH_WIDTH - NODE_SIZE;

                  return (
                    <View key={achievement.id}>
                      {/* Connecting line */}
                      {index > 0 && (
                        <View style={[styles.connectorLine, { 
                          backgroundColor: isUnlocked ? eraColor + '40' : palette.secondaryText + '15',
                          left: PATH_WIDTH / 2 - 1,
                        }]} />
                      )}

                      {/* Node */}
                      <View style={[styles.nodeRow, { marginLeft: nodeOffset }]}>
                        <View style={[
                          styles.nodeCircle, 
                          { 
                            borderColor: isUnlocked ? eraColor : palette.secondaryText + '30',
                            backgroundColor: isUnlocked 
                              ? eraColor + '15' 
                              : palette.secondaryText + '08',
                          }
                        ]}>
                          {isUnlocked && hasImage ? (
                            <Image 
                              source={REWARD_IMAGES[achievement.id]} 
                              style={styles.nodeImage} 
                            />
                          ) : isUnlocked ? (
                            <Cup size={28} color={eraColor} variant="Bold" />
                          ) : (
                            <Lock1 size={24} color={palette.secondaryText + '50'} variant="Bold" />
                          )}
                        </View>

                        {/* Label */}
                        <View style={[
                          styles.nodeLabel, 
                          isLeft ? { marginLeft: 12 } : { marginRight: 12, alignItems: 'flex-end' },
                          !isLeft && { flexDirection: 'row-reverse' }
                        ]}>
                          <View>
                            <Text 
                              style={[
                                styles.nodeName, 
                                { color: isUnlocked ? palette.primaryText : palette.secondaryText + '80' }
                              ]}
                              numberOfLines={1}
                            >
                              {achievement.title}
                            </Text>
                            <Text 
                              style={[
                                styles.nodeDesc, 
                                { 
                                  color: palette.secondaryText,
                                  textAlign: isLeft ? 'left' : 'right',
                                }
                              ]}
                              numberOfLines={2}
                            >
                              {achievement.description}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Final message */}
        <View style={styles.finalMessage}>
          <Text style={[styles.finalEmoji]}>🌟</Text>
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
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
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
    marginBottom: 16,
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
    paddingBottom: 60,
  },
  eraSection: {
    marginBottom: 32,
  },
  eraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
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
  nodesContainer: {
    paddingLeft: 0,
  },
  connectorLine: {
    position: 'absolute',
    width: 2,
    height: 40,
    top: -20,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: NODE_SIZE + 160,
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodeImage: {
    width: NODE_SIZE - 6,
    height: NODE_SIZE - 6,
    borderRadius: (NODE_SIZE - 6) / 2,
  },
  nodeLabel: {
    flex: 1,
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  nodeDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.7,
    lineHeight: 16,
  },
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
