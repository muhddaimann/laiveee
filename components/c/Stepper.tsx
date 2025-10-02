import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Avatar, Divider } from "react-native-paper";

export const Stepper = ({
  activeStep,
  steps,
}: {
  activeStep: number;
  steps: string[];
}) => {
  const theme = useTheme();
  return (
    <View style={styles.stepperContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepContainer}>
            <Avatar.Text
              size={24}
              label={`${index + 1}`}
              style={{
                backgroundColor:
                  index <= activeStep
                    ? theme.colors.primary
                    : theme.colors.surfaceDisabled,
              }}
              color={
                index <= activeStep
                  ? theme.colors.onPrimary
                  : theme.colors.onSurfaceDisabled
              }
            />
            <Text
              style={[
                styles.stepLabel,
                {
                  color:
                    index <= activeStep
                      ? theme.colors.primary
                      : theme.colors.onSurfaceDisabled,
                },
              ]}
            >
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <Divider style={styles.stepperDivider} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  stepContainer: { alignItems: "center", gap: 8, flex: 1 },
  stepLabel: { fontSize: 12, fontWeight: "bold" },
  stepperDivider: { flex: 1, marginHorizontal: 8 },
});

export default Stepper;
