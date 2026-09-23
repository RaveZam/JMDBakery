import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet } from "react-native";

type PulsingDotProps = {
  color: string;
  size?: number;
};

// A status dot that beams outward on a loop, e.g. next to "pending" text.
export function PulsingDot({ color, size = 8 }: PulsingDotProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 2.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Start right away; stop it if the OS setting turns out to want reduced motion.
    loop.start();
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) loop.stop();
    });

    return () => loop.stop();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.core,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Animated.View
        style={[
          styles.beam,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  core: {
    alignItems: "center",
    justifyContent: "center",
  },
  beam: {
    position: "absolute",
  },
});
