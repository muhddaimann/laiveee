import React, { useState } from "react";
import { View, StyleSheet, Clipboard } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  TextInput,
  SegmentedButtons,
  Switch,
  List,
} from "react-native-paper";
import { useNotification } from "../../../contexts/notificationContext";
import {
  Candidate,
  registerCandidate,
  inviteCandidate,
  RegisterCandidatePayload,
} from "../../../contexts/api/candidate";
import Stepper from "../Stepper";

function RegisterView({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const notification = useNotification();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [shortName, setShortName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [registeredCandidate, setRegisteredCandidate] =
    useState<Candidate | null>(null);

  // bottom row states
  const [autoInvite, setAutoInvite] = useState(true);
  const [expiryDays, setExpiryDays] = useState("2");
  const [note, setNote] = useState("");

  const steps = ["Enter Details", "Confirm & Act"];
  const isStep1Valid =
    fullName.trim() !== "" && email.trim() !== "" && role.trim() !== "";
  const publicLink = registeredCandidate
    ? `http://localhost:8081/d/${registeredCandidate.PublicToken}`
    : "";

  const handleNext = () => {
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      notification.showToast("Please enter a valid email address.", {
        type: "error",
      });
      return;
    }
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handleRegister = async () => {
    const input: RegisterCandidatePayload = {
      full_name: fullName,
      by_name: shortName || undefined,
      email,
      role,
    };
    setIsSubmitting(true);
    try {
      const res = await registerCandidate(input);
      setRegisteredCandidate(res.data);
      notification.showToast("Candidate registered successfully!", {
        type: "success",
      });

      // optional: auto-invite immediately if toggled on
      if (autoInvite) {
        setIsInviting(true);
        try {
          const inviteRes = await inviteCandidate(res.data.PublicToken);
          if (inviteRes.data.success) {
            notification.showToast("Invitation sent!", { type: "success" });
            setRegisteredCandidate((prev) =>
              prev ? { ...prev, Status: "invited" } : prev
            );
          }
        } finally {
          setIsInviting(false);
        }
      }
    } catch (e: any) {
      notification.showToast(
        e.response?.data?.error || "Failed to register candidate.",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!registeredCandidate) return;
    setIsInviting(true);
    try {
      const res = await inviteCandidate(registeredCandidate.PublicToken);
      if (res.data.success) {
        notification.showToast("Invitation sent successfully!", {
          type: "success",
        });
        setRegisteredCandidate((prev) =>
          prev ? { ...prev, Status: "invited" } : null
        );
      } else {
        throw new Error(res.data.message || "Failed to send invitation.");
      }
    } catch (e: any) {
      notification.showToast(
        e.response?.data?.error || e.message || "An error occurred.",
        { type: "error" }
      );
    } finally {
      setIsInviting(false);
    }
  };

  const SummaryRow = ({ label, value }: { label: string; value?: string }) => (
    <View
      style={[
        styles.summaryRow,
        { borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <Text
        style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Text style={styles.summaryValue}>{value || "-"}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingBottom: 16, alignSelf: "flex-end" }}>
        <Button icon="arrow-left" onPress={onClose}>
          Back to Dashboard
        </Button>
      </View>

      {/* ===== TOP ROW: Registration Card ===== */}
      <Card style={[styles.rowCard, { backgroundColor: theme.colors.surface }]}>
        <View
          style={[
            styles.topStepperBar,
            { borderBottomColor: theme.colors.outlineVariant },
          ]}
        >
          <Stepper activeStep={step} steps={steps} />
        </View>

        {step === 0 && (
          <Card.Content style={styles.regContent}>
            <View style={styles.formRow}>
              <View style={styles.formInputContainer}>
                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  mode="outlined"
                />
              </View>
              <View style={styles.formInputContainer}>
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formInputContainer}>
                <TextInput
                  label="Short Name (Nickname)"
                  value={shortName}
                  onChangeText={setShortName}
                  mode="outlined"
                />
              </View>
              <View style={styles.formInputContainer}>
                <Text
                  style={[
                    styles.segmentedButtonLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Role
                </Text>
                <SegmentedButtons
                  value={role}
                  onValueChange={setRole}
                  buttons={[
                    { value: "Customer Service Agent", label: "CS Agent" },
                    { value: "Talent Acquisition", label: "TA" },
                  ]}
                />
              </View>
            </View>
          </Card.Content>
        )}

        {step === 1 && (
          <Card.Content style={styles.regContent}>
            <Card style={{ backgroundColor: theme.colors.background }}>
              <Card.Content>
                <SummaryRow label="Full Name" value={fullName} />
                <SummaryRow label="Nickname" value={shortName} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Role" value={role} />
              </Card.Content>
            </Card>

            {registeredCandidate && (
              <View style={{ marginTop: 24 }}>
                <TextInput
                  label="Public Interview Link"
                  value={publicLink}
                  editable={false}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon="content-copy"
                      onPress={() => {
                        Clipboard.setString(publicLink);
                        notification.showToast("Link copied!", {
                          type: "success",
                        });
                      }}
                    />
                  }
                />
              </View>
            )}
          </Card.Content>
        )}

        {/* Actions now sit inside the top card, removing the old blank spacer */}
        <Card.Actions style={styles.regActions}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {step === 1 && !registeredCandidate && (
              <Button onPress={handleBack} icon="arrow-left">
                Back
              </Button>
            )}
            {step === 0 && (
              <Button
                mode="contained"
                onPress={handleNext}
                disabled={!isStep1Valid}
                icon="arrow-right"
                contentStyle={{ flexDirection: "row-reverse" }}
              >
                Next
              </Button>
            )}
            {step === 1 && !registeredCandidate && (
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="account-plus"
              >
                Register
              </Button>
            )}
            {step === 1 && registeredCandidate && (
              <Button
                mode="contained"
                onPress={handleInvite}
                loading={isInviting}
                disabled={
                  isInviting || registeredCandidate.Status === "invited"
                }
                icon="email-fast"
              >
                Invite
              </Button>
            )}
          </View>
        </Card.Actions>
      </Card>

      {/* ===== BOTTOM ROW: Two columns ===== */}
      <View style={styles.bottomRow}>
        {/* Left column: Invitation settings & reminder */}
        <Card
          style={[styles.bottomCol, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Title title="Invitation Settings & Reminder" />
          <Card.Content style={{ gap: 12 }}>
            <View style={styles.inlineRow}>
              <Text style={{ flex: 1 }}>Auto-invite after register</Text>
              <Switch value={autoInvite} onValueChange={setAutoInvite} />
            </View>
            <View style={styles.inlineRow}>
              <TextInput
                label="Expiry (days)"
                value={expiryDays}
                onChangeText={setExpiryDays}
                keyboardType="number-pad"
                mode="outlined"
                style={{ flex: 1 }}
              />
              <View style={{ width: 12 }} />
              <TextInput
                label="Short note (optional)"
                value={note}
                onChangeText={setNote}
                mode="outlined"
                style={{ flex: 2 }}
              />
            </View>
            <Text
              style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
            >
              Candidates have {expiryDays || "2"} day(s) to complete the
              interview after receiving the invite.
            </Text>
          </Card.Content>
        </Card>

        {/* Right column: Tips & quick actions */}
        <Card
          style={[styles.bottomCol, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Title title="Tips & Quick Actions" />
          <Card.Content style={{ gap: 12 }}>
            <TextInput
              label="Copyable invite text"
              mode="outlined"
              multiline
              value={`Hi ${shortName || fullName || "there"},

You’re invited to complete your assessment for the ${role || "selected"} role.

Start here: ${publicLink || "[link appears after register]"}

This link is valid for ${expiryDays || "2"} day(s).

Best,
The Hiring Team`}
              right={
                <TextInput.Icon
                  icon="content-copy"
                  onPress={() => {
                    const txt = `Hi ${shortName || fullName || "there"},

You’re invited to complete your assessment for the ${role || "selected"} role.

Start here: ${publicLink || "[link appears after register]"}

This link is valid for ${expiryDays || "2"} day(s).

Best,
The Hiring Team`;
                    Clipboard.setString(txt);
                    notification.showToast("Copied to clipboard!", {
                      type: "success",
                    });
                  }}
                />
              }
            />
            <List.Section>
              <List.Subheader>Best practices</List.Subheader>
              <List.Item
                title="Use a corporate sender & DKIM"
                left={(p) => <List.Icon {...p} icon="shield-check" />}
              />
              <List.Item
                title="Set clear deadline & next steps"
                left={(p) => <List.Icon {...p} icon="calendar-clock" />}
              />
            </List.Section>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  regCardTitle: { paddingTop: 8, paddingBottom: 16 },
  regHeader: { padding: 20, borderBottomWidth: 1 },
  regContent: { padding: 24, flex: 1 },
  formRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  formInputContainer: { flex: 1 },
  segmentedButtonLabel: { fontSize: 12, marginBottom: 8, marginLeft: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  regActions: { padding: 16, justifyContent: "flex-end" },
  rowCard: { width: "100%", borderRadius: 12, marginBottom: 16 },
  bottomRow: { flexDirection: "row", gap: 16 },
  bottomCol: { flex: 1, borderRadius: 12 },
  inlineRow: { flexDirection: "row", alignItems: "center" },
  topStepperBar: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});

export default RegisterView;
