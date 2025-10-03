import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
  Divider,
  Icon,
  ProgressBar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import {
  Candidate,
  CandidateRecord,
  CandidateStatus,
  inviteCandidate,
  updateCandidateStatus,
} from "../../../contexts/api/candidate";
import { useNotification } from "../../../contexts/notificationContext";
import { useStatus } from "../../../hooks/useStatus";

// --- Reusable Sub-Components ---

function StatusPill({ status }: { status: CandidateStatus }) {
  const { backgroundColor, color } = useStatus(status);
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <View style={styles.sectionHeader}>
    <Text variant="titleLarge">{title}</Text>
    {action ?? null}
  </View>
);

// --- Redesigned View Components ---

const CandidateHeader = ({ candidate }: { candidate: Candidate }) => (
  <View style={styles.headerContainer}>
    <Avatar.Text
      size={64}
      label={candidate.ByName?.charAt(0) || candidate.FullName.charAt(0)}
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerName}>{candidate.FullName}</Text>
      <Text style={styles.headerRole}>
        {`${candidate.Role} #${candidate.ID} • ${candidate.Email}`}
      </Text>
    </View>
    <StatusPill status={candidate.Status} />
  </View>
);

const DeadlineSection = ({ candidate }: { candidate: Candidate }) => {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (candidate.Status !== "invited") return;
    const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, [candidate.Status]);

  if (candidate.Status !== "invited" || !candidate.ExpiresAt) {
    return null;
  }

  const expiresAt = new Date(candidate.ExpiresAt).getTime();
  const inviteSentAt = new Date(candidate.InviteSentAt!).getTime();
  const totalDuration = expiresAt - inviteSentAt;
  const elapsed = now - inviteSentAt;
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

  const remainingMillis = Math.max(0, expiresAt - now);
  const remainingHours = Math.floor(remainingMillis / (1000 * 60 * 60));
  const remainingDays = Math.floor(remainingHours / 24);

  let countdownText = "Expired";
  if (remainingDays > 0) {
    countdownText = `${remainingDays} day${
      remainingDays > 1 ? "s" : ""
    } remaining`;
  } else if (remainingHours > 0) {
    countdownText = `${remainingHours} hour${
      remainingHours > 1 ? "s" : ""
    } remaining`;
  }

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <View style={styles.deadlineContainer}>
          <Text style={styles.deadlineTitle}>Deadline</Text>
          <Text style={styles.deadlineCountdown}>{countdownText}</Text>
        </View>
        <ProgressBar progress={progress} color={theme.colors.primary} />
      </Card.Content>
    </Card>
  );
};

const ResultSummarySection = ({
  record,
}: {
  record: CandidateRecord | null;
}) => {
  const theme = useTheme();
  const rolefit = record?.ra_rolefit_score;
  const interview = record?.int_average_score;

  return (
    <View style={styles.summarySectionContainer}>
      <Card
        style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content style={styles.summaryCardContent}>
          <Text style={styles.cardTitle}>Role Fit</Text>
          {rolefit ? (
            <>
              <Text style={[styles.score, { color: theme.colors.primary }]}>
                {rolefit} <Text style={styles.scoreDenominator}>/ 10</Text>
              </Text>
              <Text style={styles.justification} numberOfLines={2}>
                {record?.ra_rolefit_reason}
              </Text>
            </>
          ) : (
            <Text
              style={[styles.score, { color: theme.colors.onSurfaceDisabled }]}
            >
              N/A
            </Text>
          )}
        </Card.Content>
      </Card>
      <Card
        style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content style={styles.summaryCardContent}>
          <Text style={styles.cardTitle}>Interview</Text>
          {interview ? (
            <>
              <Text style={[styles.score, { color: theme.colors.primary }]}>
                {Number(interview).toFixed(1)}{" "}
                <Text style={styles.scoreDenominator}>/ 5.0</Text>
              </Text>
              <Text style={styles.justification} numberOfLines={2}>
                {record?.int_summary}
              </Text>
            </>
          ) : (
            <Text
              style={[styles.score, { color: theme.colors.onSurfaceDisabled }]}
            >
              N/A
            </Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const CandidateActionsCard = ({ ...props }) => {
  const theme = useTheme();
  return (
    <Card
      style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="email-fast-outline"
          disabled={props.candidate.Status !== "registered" || props.loading}
          onPress={() =>
            props.handleAction(
              () => inviteCandidate(props.candidate.PublicToken),
              "Invitation sent!"
            )
          }
          style={styles.actionButton}
        >
          Invite
        </Button>
        <Button
          mode="contained"
          icon="check-circle-outline"
          disabled={props.candidate.Status !== "completed" || props.loading}
          onPress={() =>
            props.handleAction(
              () =>
                updateCandidateStatus(props.candidate.PublicToken, {
                  status: "passed",
                }),
              "Candidate marked as passed"
            )
          }
          style={styles.actionButton}
          buttonColor={theme.colors.tertiaryContainer}
          textColor={theme.colors.onTertiaryContainer}
        >
          Pass
        </Button>
        <Button
          mode="contained"
          icon="close-circle-outline"
          disabled={props.candidate.Status !== "completed" || props.loading}
          onPress={() =>
            props.handleAction(
              () =>
                updateCandidateStatus(props.candidate.PublicToken, {
                  status: "rejected",
                }),
              "Candidate marked as rejected"
            )
          }
          style={styles.actionButton}
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.onErrorContainer}
        >
          Reject
        </Button>
      </Card.Content>
    </Card>
  );
};

const HistoryStepper = ({ candidate }: { candidate: Candidate }) => {
  const theme = useTheme();

  const invitedDone =
    !!candidate.InviteSentAt ||
    [
      "invited",
      "completed",
      "passed",
      "rejected",
      "expired",
      "withdrawn",
    ].includes(candidate.Status);

  const completedDone =
    !!candidate.CompletedAt ||
    ["completed", "passed", "rejected"].includes(candidate.Status);

  const decidedDone = ["passed", "rejected", "expired", "withdrawn"].includes(
    candidate.Status
  );

  const steps = [
    { label: "Invited", done: invitedDone },
    { label: "Completed", done: completedDone },
    { label: "Decided", done: decidedDone },
  ];

  const activeIndex = decidedDone
    ? 2
    : completedDone
    ? 1
    : invitedDone
    ? 0
    : -1;

  const decidedIcon =
    candidate.Status === "passed"
      ? "check-decagram"
      : candidate.Status === "rejected"
      ? "close-octagon"
      : "progress-clock";

  const decidedColor =
    candidate.Status === "passed"
      ? theme.colors.tertiary
      : candidate.Status === "rejected"
      ? theme.colors.error
      : theme.colors.primary;

  const formatDT = (dt?: string | null) =>
    dt ? new Date(dt).toLocaleString() : "N/A";

  const decidedAt =
    candidate.Status === "passed" || candidate.Status === "rejected"
      ? candidate.DecisionAt
      : candidate.Status === "withdrawn"
      ? (candidate as any).WithdrawnAt ?? null
      : candidate.Status === "expired"
      ? candidate.ExpiresAt ?? null
      : null;

  return (
    <Card
      style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content style={styles.stepperContainer}>
        {steps.map((s, idx) => {
          const isActive = idx === activeIndex;
          const isDone = s.done && idx < activeIndex;
          const isLast = idx === steps.length - 1;

          let icon = "progress-clock";
          let tint = theme.colors.onSurfaceDisabled;
          let bg = theme.colors.surfaceVariant;

          if (idx === 0) {
            icon = s.done
              ? "email-check-outline"
              : isActive
              ? "email-fast-outline"
              : "email-outline";
          } else if (idx === 1) {
            icon = s.done
              ? "check-circle-outline"
              : isActive
              ? "progress-clock"
              : "checkbox-blank-circle-outline";
          } else if (idx === 2) {
            icon = decidedIcon;
          }

          if (idx === 2) {
            tint = s.done ? decidedColor : tint;
            bg = s.done
              ? candidate.Status === "rejected"
                ? theme.colors.errorContainer
                : theme.colors.tertiaryContainer
              : bg;
          } else if (isDone || isActive) {
            tint = theme.colors.primary;
            bg = theme.colors.primaryContainer;
          }

          const timeText =
            idx === 0
              ? formatDT(candidate.InviteSentAt)
              : idx === 1
              ? formatDT(candidate.CompletedAt)
              : formatDT(decidedAt);

          return (
            <React.Fragment key={s.label}>
              <View style={styles.stepNode}>
                <Avatar.Icon
                  size={40}
                  icon={icon}
                  color={tint}
                  style={{ backgroundColor: bg }}
                />
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive || isDone ? tint : theme.colors.onSurface,
                    },
                  ]}
                >
                  {s.label}
                </Text>
                <Text
                  style={[
                    styles.stepTime,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                  numberOfLines={1}
                >
                  {timeText}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </Card.Content>
    </Card>
  );
};

const SelectedCandidateView = ({ ...props }) => {
  const router = useRouter();
  const { candidate, record } = props;
  const canShowResult =
    record && ["completed", "passed", "rejected"].includes(candidate.Status);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <CandidateHeader candidate={candidate} />
      <DeadlineSection candidate={candidate} />
      <SectionHeader
        title="Result Summary"
        action={
          canShowResult ? (
            <Button
              mode="outlined"
              icon="poll"
              onPress={() => router.push(`/c/result/${candidate.PublicToken}`)}
            >
              View Full Result
            </Button>
          ) : null
        }
      />
      <ResultSummarySection record={record} />
      <SectionHeader title="Actions" />
      <CandidateActionsCard {...props} />
      <SectionHeader title="History" />
      <HistoryStepper candidate={candidate} />
    </ScrollView>
  );
};

const Placeholder = () => {
  const theme = useTheme();
  return (
    <View style={styles.placeholderContainer}>
      <Avatar.Icon
        icon="cursor-default-click-outline"
        size={80}
        style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.placeholderTitle}>Select a Candidate</Text>
      <Text style={styles.placeholderText}>
        Choose a candidate from the list to view their details.
      </Text>
    </View>
  );
};

// --- Main Exported Component ---

export default function RightColumnView({ ...props }) {
  const [loading, setLoading] = useState(false);
  const notification = useNotification();
  const theme = useTheme();

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string
  ) => {
    setLoading(true);
    props.setLoading(true);
    try {
      const res = await action();
      if (res.data.success) {
        notification.showToast(successMessage, { type: "success" });
        props.onActionSuccess();
      } else {
        throw new Error(res.data.error || "Action failed");
      }
    } catch (e: any) {
      notification.showToast(e.response?.data?.error || e.message, {
        type: "error",
      });
    }
    setLoading(false);
    props.setLoading(false);
  };

  if (props.isDetailLoading) {
    return (
      <View style={styles.detailOverlay}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!props.selectedCandidate) {
    return <Placeholder />;
  }

  return (
    <SelectedCandidateView
      candidate={props.selectedCandidate}
      record={props.latestRecord}
      onActionSuccess={props.onActionSuccess}
      setLoading={props.setLoading}
      handleAction={handleAction}
      loading={loading}
      theme={theme}
    />
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 24, gap: 24 },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTextContainer: { flex: 1, gap: 2 },
  headerName: { fontSize: 22, fontWeight: "bold" },
  headerRole: { fontSize: 14, color: "gray" },
  // Deadline
  deadlineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  deadlineTitle: { fontSize: 16, fontWeight: "600" },
  deadlineCountdown: { fontSize: 14, color: "gray" },
  // Summary Section
  summarySectionContainer: { flexDirection: "row", gap: 16 },
  summaryCard: { flex: 1 },
  summaryCardContent: { alignItems: "center", gap: 8, paddingVertical: 24 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  score: { fontSize: 36, fontWeight: "bold" },
  scoreDenominator: { fontSize: 18, color: "gray" },
  justification: { fontSize: 12, color: "gray", textAlign: "center" },
  // Generic Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -12,
    zIndex: 1,
    marginLeft: 12,
  },
  sectionCard: { paddingTop: 12 },
  // Actions
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  actionButton: { flex: 1 },
  // History Stepper (styles are the same as before)
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepNode: { alignItems: "center", gap: 4, minWidth: 90 },
  stepLabel: { fontSize: 12, fontWeight: "600" },
  stepTime: { fontSize: 11 },
  stepLine: { flex: 1, height: 2, marginHorizontal: -12 },
  // Placeholder
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  placeholderTitle: { fontSize: 20, fontWeight: "600" },
  placeholderText: { color: "gray", textAlign: "center", maxWidth: 250 },
  // Pill
  pill: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
