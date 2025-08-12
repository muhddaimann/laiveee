import React, { useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { useTheme, TextInput, Button } from "react-native-paper";

type PasswordPromptModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onSubmit: (password: string) => void;
  onClose: () => void;
};

export default function PasswordPromptModal({
  visible,
  title,
  message,
  onSubmit,
  onClose,
}: PasswordPromptModalProps) {
  const theme = useTheme();
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(password);
    setPassword("");
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button
              onPress={onClose}
              mode="text"
              textColor={theme.colors.primary}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              mode="contained"
              buttonColor={theme.colors.primary}
              style={styles.button}
            >
              OK
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    width: "80%",
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    marginLeft: 8,
  },
});
