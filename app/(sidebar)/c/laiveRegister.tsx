import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Clipboard } from "react-native";
import {
  TextInput,
  Button,
  Card,
  useTheme,
  Text,
  Avatar,
  Divider,
  Chip,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/c/header";
import { useNotification } from "../../../contexts/notificationContext";
import {
  registerCandidate,
  inviteCandidate,
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

  const isButtonDisabled = !fullName || !email || !role || isSubmitting;

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
  const notification = useNotification();
  const [isInviting, setIsInviting] = useState(false);
  const [localCandidate, setLocalCandidate] = useState(candidate);
  const publicLink = `http://localhost:8081/d/${localCandidate.PublicToken}`;

  const handleInvite = () => {
    notification.showAlert({
      title: "Confirm Invitation",
      message: `This will send an invitation to ${localCandidate.FullName}. They will have 2 days to complete the interview. Do you want to proceed?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Invite",
          onPress: async () => {
            setIsInviting(true);
            try {
              const res = await inviteCandidate(localCandidate.PublicToken);
              if (res.success) {
                notification.showToast("Invitation sent successfully!", {
                  type: "success",
                });
                setLocalCandidate((prev) => ({ ...prev, Status: "invited" }));
              } else {
                throw new Error(res.message || "Failed to send invitation.");
              }
            } catch (e: any) {
              notification.showToast(e.message || "An error occurred.", {
                type: "error",
              });
            }
            setIsInviting(false);
          },
        },
      ],
    });
  };

  const isInvited = localCandidate.Status === "invited";

  return (
    <>
      <Card.Title
        title="Candidate Registered"
        subtitle={`ID: ${localCandidate.ID}`}
      />
      <Card.Content style={styles.successContainer}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={64}
            label={
              localCandidate.ByName?.charAt(0) ||
              localCandidate.FullName.charAt(0)
            }
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.profileName}>{localCandidate.FullName}</Text>
            <Text style={styles.profileRole}>{localCandidate.Role}</Text>
          </View>
          <Chip
            icon={isInvited ? "check" : "clock-outline"}
            selected={isInvited}
          >
            {localCandidate.Status}
          </Chip>
        </View>

        <Divider style={{ width: "100%", marginVertical: 16 }} />

        {isInvited ? (
          <View style={styles.linkContainer}>
            <LabeledInput
              label="Public Interview Link"
              value={publicLink}
              editable={false}
              right={
                <TextInput.Icon
                  icon="content-copy"
                  onPress={() => {
                    Clipboard.setString(publicLink);
                    notification.showToast("Link copied!", { type: "success" });
                  }}
                />
              }
            />
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.actionTitle}>Next Step: Send Invitation</Text>
            <Text style={styles.actionSubtitle}>
              The candidate needs to be invited to receive their unique
              interview link via email.
            </Text>
            <Button
              mode="contained"
              icon="email-fast-outline"
              style={{ marginTop: 20 }}
              onPress={handleInvite}
              loading={isInviting}
              disabled={isInviting}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16 }}
            >
              Invite Candidate
            </Button>
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={onReset} icon="plus" disabled={isInviting}>
          Register Another
        </Button>
        <Button
          mode="contained-tonal"
          onPress={onDone}
          icon="check-all"
          disabled={isInviting}
        >
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
      <Header page="Register Candidate" showBack />
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
  card: { width: "100%", maxWidth: 700 },
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#666",
  },
  actions: { padding: 16, justifyContent: "flex-end" },
  successContainer: { alignItems: "center", padding: 16 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileRole: {
    fontSize: 16,
    color: "gray",
  },
  linkContainer: {
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },
});
