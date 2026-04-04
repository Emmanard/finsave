import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface GoalCelebrationProps {
  visible: boolean;
  onDismiss: () => void;
}

const DOTS = 20;

export function GoalCelebration({ visible, onDismiss }: GoalCelebrationProps) {
  const scales = useRef(Array.from({ length: DOTS }, () => new Animated.Value(0))).current;
  const opacities = useRef(Array.from({ length: DOTS }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const animations = scales.map((s, i) =>
      Animated.timing(s, {
        toValue: 1,
        duration: 900,
        delay: i * 12,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const fades = opacities.map((o, i) =>
      Animated.timing(o, {
        toValue: 1,
        duration: 250,
        delay: i * 12,
        useNativeDriver: true,
      }),
    );
    Animated.parallel([...animations, ...fades]).start();
  }, [visible, scales, opacities]);

  if (!visible) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.overlay}>
      <View style={styles.center}>
        {scales.map((s, i) => {
          const hue = (i * 37) % 360;
          const left = `${(i * 17) % 100}%` as `${number}%`;
          const top = `${(i * 23) % 100}%` as `${number}%`;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: `hsl(${hue}, 85%, 60%)`,
                  left,
                  top,
                  opacity: opacities[i],
                  transform: [{ scale: s }],
                },
              ]}
            />
          );
        })}
        <Text style={[typography.h2, styles.title]}>Goal Achieved! 🎉</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  center: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
