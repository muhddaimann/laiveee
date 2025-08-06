import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, useTheme, Card, TextInput, Button } from "react-native-paper";

export default function LaiveApplicant() {
  const theme = useTheme();
  const [name, setName] = React.useState("");
  const [position, setPosition] = React.useState("");

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Apply with Laive
        </Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Position Applying For"
              value={position}
              onChangeText={setPosition}
              mode="outlined"
              style={styles.input}
            />
            <Button mode="contained" disabled={!name || !position}>
              Submit Application
            </Button>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.right}>
        <Image
          source={require("../../../assets/ta1.png")}
          style={styles.avatar}
        />
        <Text style={styles.avatarLabel}>Candidate Preview</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  left: { flex: 4, padding: 24, borderRightWidth: 1, borderRightColor: "#eee" },
  right: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { padding: 16, borderRadius: 12 },
  input: { marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  avatarLabel: { fontSize: 16, fontWeight: "500" },
});
