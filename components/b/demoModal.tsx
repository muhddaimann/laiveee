import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Button, useTheme, IconButton } from "react-native-paper";
import { instructions } from "../../utils/conversationConfig";

interface DemoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DemoModal({ visible, onClose }: DemoModalProps) {
  const theme = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [focusedField, setFocusedField] = useState<"apiKey" | "mode" | null>(
    null
  );

  const handleSave = () => {
    onClose();
  };

  const getInputStyle = (field: "apiKey" | "mode") =>
    StyleSheet.flatten([
      styles.input,
      {
        borderColor:
          focusedField === field ? theme.colors.primary : theme.colors.outline,
        color: theme.colors.onSurface,
      },
    ]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[styles.card, { backgroundColor: theme.colors.background }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.primary }]}>
                Voicebot Configuration
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={onClose}
                iconColor={theme.colors.onSurface}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                API Key
              </Text>
              <TextInput
                style={getInputStyle("apiKey")}
                placeholder="Enter your OpenAI API Key"
                placeholderTextColor={theme.colors.outline}
                value={apiKey}
                onChangeText={setApiKey}
                onFocus={() => setFocusedField("apiKey")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                Voicebot Instructions
              </Text>
              <ScrollView style={styles.instructionsBox}>
                <Text style={{ fontSize: 13, color: theme.colors.onSurface }}>
                  {instructions.trim()}
                </Text>
              </ScrollView>
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onClose}
                style={styles.button}
                textColor={theme.colors.onSurface}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
              >
                Save
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  section: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  instructionsBox: {
    maxHeight: 180,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  button: {
    marginLeft: 8,
    minWidth: 100,
  },
});
