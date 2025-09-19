import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Card,
  useTheme,
  Text,
  Avatar,
  Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/c/header";
import { useNotification } from "../../../contexts/notificationContext";
import {
  registerCandidate,
  Candidate,
  RegisterCandidateInput,
} from "../../../contexts/api/candidate";

type RegisterFormProps = {
  onRegister: (input: RegisterCandidateInput) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

type SuccessViewProps = {
  candidate: Candidate;
  onReset: () => void;
  onDone: () => void;
};

type LabeledInputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

const LabeledInput: React.FC<LabeledInputProps> = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput mode="outlined" {...props} />
  </View>
);

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onCancel,
  isSubmitting,
}) => {
  const [fullName, setFullName] = useState("");
  const [shortName, setShortName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handlePress = () => {
    const input: RegisterCandidateInput = {
      full_name: fullName,
      by_name: shortName || null,
      email,
      role,
    };
    onRegister(input);
  };

  const isButtonDisabled = !fullName || !email || !role || isSubmitting; // shortName is optional server-side

  return (
    <>
      <Card.Title title="New Candidate Details" subtitle="Enter details" />
      <Card.Content>
        <LabeledInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          disabled={isSubmitting}
          left={<TextInput.Icon icon="account" />}
        />
        <LabeledInput
          label="Short Name (Nickname)"
          value={shortName}
          onChangeText={setShortName}
          disabled={isSubmitting}
          left={<TextInput.Icon icon="account-outline" />}
        />
        <LabeledInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isSubmitting}
          left={<TextInput.Icon icon="email" />}
        />
        <LabeledInput
          label="Role Applied For"
          value={role}
          onChangeText={setRole}
          disabled={isSubmitting}
          left={<TextInput.Icon icon="briefcase" />}
        />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handlePress}
          disabled={isButtonDisabled}
          loading={isSubmitting}
          icon="account-plus"
        >
          Register Candidate
        </Button>
      </Card.Actions>
    </>
  );
};

const SuccessView: React.FC<SuccessViewProps> = ({
  candidate,
  onReset,
  onDone,
}) => {
  const theme = useTheme();
  return (
    <>
      <Card.Content style={styles.successContainer}>
        <Avatar.Icon
          icon="check-decagram"
          size={80}
          style={{
            backgroundColor: theme.colors.primaryContainer,
            marginBottom: 16,
          }}
          color={theme.colors.primary}
        />
        <Text style={styles.successTitle}>Candidate Registered</Text>
        <Text style={styles.successSubtitle}>Saved to database</Text>
        <View style={{ width: "100%", gap: 8, marginTop: 16 }}>
          <Text>ID: {candidate.ID}</Text>
          <Text>Full Name: {candidate.FullName}</Text>
          <Text>By Name: {candidate.ByName ?? "-"}</Text>
          <Text>Email: {candidate.Email}</Text>
          <Text>Role: {candidate.Role}</Text>
          <Text>Status: {candidate.Status}</Text>
          <Text>Public Token: {candidate.PublicToken}</Text>
          <Text>Created: {candidate.CreatedDateTime}</Text>
        </View>
      </Card.Content>
      <Divider />
      <Card.Actions style={styles.actions}>
        <Button onPress={onReset} icon="plus">
          Register Another
        </Button>
        <Button mode="contained" onPress={onDone} icon="check-all">
          Done
        </Button>
      </Card.Actions>
    </>
  );
};

export default function LaiveRegister() {
  const theme = useTheme();
  const router = useRouter();
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCandidate, setRegisteredCandidate] =
    useState<Candidate | null>(null);

  const handleRegister = async (input: RegisterCandidateInput) => {
    setIsSubmitting(true);
    try {
      const newCandidate = await registerCandidate(input);
      setRegisteredCandidate(newCandidate);
      notification.showToast("Candidate registered.", { type: "success" });
    } catch (e: any) {
      notification.showToast(e?.message || "Failed to register candidate.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <Header page="Register Candidate" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {registeredCandidate ? (
            <SuccessView
              candidate={registeredCandidate}
              onReset={() => setRegisteredCandidate(null)}
              onDone={() => router.back()}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
            />
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: { width: "100%", maxWidth: 600 },
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#666",
  },
  actions: { padding: 16, justifyContent: "flex-end" },
  successContainer: { alignItems: "flex-start", paddingVertical: 24 },
  successTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: "gray" },
});
