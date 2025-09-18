import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useAuth } from "../../contexts/authContext";

interface CHeaderProps {
  page: string;
}

export default function Header({ page }: CHeaderProps) {
  const theme = useTheme();
  const { logout, user } = useAuth();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        LaiveRecruit > {page}
      </Text>
      {user && (
        <Button
          mode="contained"
          icon="logout"
          onPress={logout}
          labelStyle={{ fontWeight: "500" }}
        >
          Logout
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    width: "100%",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});