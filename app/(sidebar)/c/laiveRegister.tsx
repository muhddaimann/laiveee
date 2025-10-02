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
  SegmentedButtons,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/c/header";
import { useNotification } from "../../../contexts/notificationContext";
import {
  registerCandidate,
  inviteCandidate,
  Candidate,
  RegisterCandidatePayload,
} from "../../../contexts/api/candidate";

const Stepper = ({ activeStep, steps }: { activeStep: number; steps: string[] }) => {
  const theme = useTheme();
  return (
    <View style={styles.stepperContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepContainer}>
            <Avatar.Text
              size={32}
              label={`${index + 1}`}
              style={{
                backgroundColor: index <= activeStep ? theme.colors.primary : theme.colors.surfaceVariant,
              }}
              color={index <= activeStep ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.stepLabel, {color: index <= activeStep ? theme.colors.primary : theme.colors.onSurfaceVariant}]}>{step}</Text>
          </View>
          {index < steps.length - 1 && <Divider style={styles.stepperDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const SummaryRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value || "-"}</Text>
  </View>
);

export default function LaiveRegister() {
  const theme = useTheme();
  const router = useRouter();
  const notification = useNotification();

  // Step and Form State
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [shortName, setShortName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // API State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [registeredCandidate, setRegisteredCandidate] = useState<Candidate | null>(null);

  const handleNext = () => {
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      notification.showToast("Please enter a valid email address.", { type: "error" });
      return;
    }
    setStep(1);
  };

  const handleBack = () => {
    setStep(0);
  };

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
      notification.showToast("Candidate registered successfully!", { type: "success" });
    } catch (e: any) {
      notification.showToast(
        e.response?.data?.error || "Failed to register candidate.",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = () => {
    if (!registeredCandidate) return;

    notification.showAlert({
      title: "Confirm Invitation",
      message: `This will send an invitation to ${registeredCandidate.FullName}. They will have 2 days to complete the interview. Do you want to proceed?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Invite",
          onPress: async () => {
            setIsInviting(true);
            try {
              const res = await inviteCandidate(registeredCandidate.PublicToken);
              if (res.data.success) {
                notification.showToast("Invitation sent successfully!", { type: "success" });
                setRegisteredCandidate((prev) => prev ? { ...prev, Status: "invited" } : null);
              } else {
                throw new Error(res.data.message || "Failed to send invitation.");
              }
            } catch (e: any) {
              notification.showToast(e.response?.data?.error || e.message || "An error occurred.", { type: "error" });
            }
            setIsInviting(false);
          },
        },
      ],
    });
  };

  const steps = ["Enter Details", "Confirm & Act"];
  const isStep1Valid = fullName.trim() !== "" && email.trim() !== "" && role.trim() !== "";
  const publicLink = registeredCandidate ? `http://localhost:8081/d/${registeredCandidate.PublicToken}` : '';

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <Header page="Register Candidate" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardContainer}>
          <Stepper activeStep={step} steps={steps} />
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {step === 0 && (
              <Card.Content style={{ paddingVertical: 24 }}>
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
                      label="Short Name (Nickname)"
                      value={shortName}
                      onChangeText={setShortName}
                      mode="outlined"
                    />
                  </View>
                </View>
                <View style={styles.formRow}>
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
                  <View style={styles.formInputContainer}>
                    <Text style={styles.segmentedButtonLabel}>Role</Text>
                    <SegmentedButtons
                      value={role}
                      onValueChange={setRole}
                      buttons={[
                        { value: 'Customer Service Agent', label: 'CS Agent' },
                        { value: 'Talent Acquisition', label: 'TA' },
                      ]}
                    />
                  </View>
                </View>
              </Card.Content>
            )}

            {step === 1 && (
              <Card.Content style={{ padding: 24 }}>
                <Text variant="titleMedium" style={{marginBottom: 16}}>Please confirm the details below:</Text>
                <SummaryRow label="Full Name" value={fullName} />
                <SummaryRow label="Nickname" value={shortName} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Role" value={role} />
                {registeredCandidate && (
                  <>
                    <Divider style={{marginVertical: 24}}/>
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
                            notification.showToast("Link copied!", { type: "success" });
                          }}
                        />
                      }
                    />
                  </>
                )}
              </Card.Content>
            )}

            <Card.Actions style={styles.actions}>
              <Button onPress={() => router.back()}>Cancel</Button>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {step === 1 && <Button onPress={handleBack} icon="arrow-left">Back</Button>}
                {step === 0 && (
                  <Button mode="contained" onPress={handleNext} disabled={!isStep1Valid} icon="arrow-right" contentStyle={{flexDirection: 'row-reverse'}}>Next</Button>
                )}
                {step === 1 && !registeredCandidate && (
                  <Button mode="contained" onPress={handleRegister} loading={isSubmitting} disabled={isSubmitting} icon="account-plus">Register</Button>
                )}
                {step === 1 && registeredCandidate && (
                  <Button mode="contained" onPress={handleInvite} loading={isInviting} disabled={isInviting || registeredCandidate.Status === 'invited'} icon="email-fast">Invite</Button>
                )}
              </View>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: {
    alignItems: "center",
    padding: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 800,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: "center",
    gap: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepperDivider: {
    flex: 1,
    marginHorizontal: 8,
  },
  card: { width: "100%" },
  formRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  formInputContainer: {
    flex: 1,
  },
  segmentedButtonLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actions: { 
    padding: 16, 
    justifyContent: "space-between", 
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
});