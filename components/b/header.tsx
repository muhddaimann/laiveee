import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDemoContext } from "../../contexts/demoContext";
import useDemo from "../../hooks/useDemo";
import DemoModal from "./demoModal";

export default function Header() {
  const theme = useTheme();
  const { options } = useDemo();
  const { selectedProject, setSelectedProject, getProjectLabel } =
    useDemoContext();
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (value: string) => {
    setSelectedProject(value);
    closeMenu();
  };

  return (
    <>
      <View
        style={[styles.wrapper, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.row}>
          <View style={styles.texts}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Laive Demo{" "}
              <Text style={{ color: theme.colors.primary }}>[AI]</Text>{" "}
              <Text style={{ color: theme.colors.secondary }}>[RAG]</Text>{" "}
            </Text>

            <Menu
              visible={visible}
              onDismiss={closeMenu}
              contentStyle={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
              }}
              anchor={
                <TouchableOpacity onPress={openMenu}>
                  <Text
                    style={[styles.dropdown, { color: theme.colors.onSurface }]}
                  >
                    {getProjectLabel(selectedProject)}
                  </Text>
                </TouchableOpacity>
              }
            >
              {options.map((opt) => (
                <Menu.Item
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  title={opt.label}
                />
              ))}
            </Menu>
          </View>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => setModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={30}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <DemoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dropdown: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    opacity: 0.8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
});
