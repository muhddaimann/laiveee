import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Card,
} from "react-native-paper";
import { useAuth } from "../../../contexts/cAuthContext";
import Header from "../../../components/layout/header";
import { useNotification } from "../../../contexts/notificationContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const notification = useNotification();

  const handleLogin = async () => {
    if (!username || !password) {
      notification.showToast("Please fill in both fields.", { type: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await login(username, password);
      if (response.status !== "success") {
        notification.showToast(
          response.message || (response as any).error || "Invalid credentials",
          { type: "error" }
        );
      }
      // On success, navigation will happen automatically via the auth context listener
    } catch {
      notification.showToast("An unexpected error occurred during login.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !username || !password || isSubmitting;

  return (
    <View style={styles.container}>
      <Header title="LaiveRecruit Login" showBack={false} />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Welcome" subtitle="Please sign in to continue" />
          <Card.Content>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              disabled={isSubmitting}
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              disabled={isSubmitting}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={isButtonDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator animating color="#fff" />
              ) : (
                "Login"
              )}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // A light grey background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
