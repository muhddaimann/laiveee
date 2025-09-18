import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../../contexts/authContext";
import Header from "../../../components/layout/header";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await login(username, password);
      if (response.status !== "success") {
        setError(response.message || response.error || "Invalid credentials");
      }
      // On success, the AuthGuard in the layout will handle the redirect
    } catch (err) {
      setError("An unexpected error occurred during login.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="LaiveRecruit Login" showBack={false} />
      <View style={styles.container}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          disabled={isSubmitting}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={isSubmitting}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button 
          mode="contained" 
          onPress={handleLogin} 
          style={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator animating={true} color="#fff" /> : "Login"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    maxWidth: 400,
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});