import { Stack } from "expo-router";
import Header from "../../../components/b/header";
import { useTheme } from "react-native-paper";

export default function DemoLayout() {
  const theme = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <Header />,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </Stack>
  );
}
