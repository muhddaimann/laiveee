import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import Sidebar from "../../components/layout/sidebar";

export default function SidebarLayout() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
