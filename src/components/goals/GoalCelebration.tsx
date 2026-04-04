import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface GoalCelebrationProps {
  visible: boolean;
  onDismiss: () => void;
}

export function GoalCelebration({ visible, onDismiss }: GoalCelebrationProps) {
  const scaleAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0)),
  ).current;
  const opacityAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!visible) {
      scaleAnims.forEach((v) => v.setValue(0));
      opacityAnims.forEach((v) => v.setValue(0));
      return;
    }
    const scaleAnimations = scaleAnims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 900,
        delay: i * 12,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const opacityAnimations = opacityAnims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 250,
        delay: i * 12,
        useNativeDriver: true,
      }),
    );
    Animated.parallel([...scaleAnimations, ...opacityAnimations]).start();
  }, [visible, scaleAnims, opacityAnims]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        {scaleAnims.map((scaleVal, i) => (
          <Animated.View
            key={`dot-${i}`}
            style={[
              styles.dot,
              {
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
                backgroundColor: `hsl(${(i * 37) % 360}, 85%, 60%)`,
                opacity: opacityAnims[i],
                transform: [{ scale: scaleVal }],
              },
            ]}
          />
        ))}
        <View style={styles.centerWrap} pointerEvents="none">
          <Text style={styles.title}>Goal Achieved! 🎉</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
  },
});
