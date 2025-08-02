import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";
import DocCard from "./docCard";
import ScreenCard from "./screenCard";
import RecruitCard from "./recruitCard";
import ApplyCard from "./applyCard";

const CARD_HEIGHT = Dimensions.get("window").height * 0.4 + 16;
const TOTAL_HEIGHT = CARD_HEIGHT * 4;
const INITIAL_OFFSET = -CARD_HEIGHT;

export default function ColumnC() {
  const scrollY = useRef(new Animated.Value(INITIAL_OFFSET)).current;

  useEffect(() => {
    let isCancelled = false;

    const animate = () => {
      if (isCancelled) return;
      scrollY.setValue(INITIAL_OFFSET);
      Animated.timing(scrollY, {
        toValue: INITIAL_OFFSET + TOTAL_HEIGHT,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (!isCancelled) animate();
      });
    };

    animate();

    return () => {
      isCancelled = true;
    };
  }, [scrollY]);

  const cards = [
    <DocCard key="interview1" />,
    <ScreenCard key="demo1" />,
    <RecruitCard key="doc1" />,
    <ApplyCard key="joke1" />,
  ];

  const animatedStyle = {
    transform: [
      {
        translateY: scrollY,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.carousel, animatedStyle]}>
        {cards}
        {cards}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    paddingVertical: 32,
    width: "100%",
  },
  carousel: {
    width: "100%",
    gap: 16,
  },
});
