import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";
import DocCard from "./docCard";
import ScreenCard from "./screenCard";
import RecruitCard from "./recruitCard";
import ApplyCard from "./applyCard";

const CARD_HEIGHT = Dimensions.get("window").height * 0.4 + 16;
const TOTAL_HEIGHT = CARD_HEIGHT * 4;

export default function ColumnB() {
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isCancelled = false;

    const animate = () => {
      if (isCancelled) return;
      scrollY.setValue(0);
      Animated.timing(scrollY, {
        toValue: TOTAL_HEIGHT,
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
    <DocCard key="demo1" />,
    <ScreenCard key="interview1" />,
    <RecruitCard key="doc1" />,
    <ApplyCard key="joke1" />,
  ];

  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, TOTAL_HEIGHT],
          outputRange: [0, -TOTAL_HEIGHT],
        }),
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
