import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
  TextInput,
  IconButton,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/c/header";
import {
  getCandidates,
  getCandidateRecords,
  inviteCandidate,
  updateCandidateStatus,
  Candidate,
  CandidateStatus,
  CandidateRecord,
} from "../../../contexts/api/candidate";
import { useNotification } from "../../../contexts/notificationContext";
import EmptyStateCard from "../../../components/c/EmptyStateCard";
import { useStatus } from "../../../hooks/useStatus";

const STATUS_FILTERS: CandidateStatus[] = [
  "registered",
  "invited",
  "completed",
  "passed",
  "rejected",
];

const RESULT_VIEWABLE_STATUSES: CandidateStatus[] = [
  "completed",
  "passed",
  "rejected",
];
const INVITEABLE_STATUS: CandidateStatus = "registered";
const DECISION_MAKING_STATUS: CandidateStatus = "completed";

function FilterPill({
  label,
  onPress,
  selected,
  status,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
  status: CandidateStatus | "all";
}) {
  const theme = useTheme();
  const defaultStyle = {
    bgColor: theme.colors.primaryContainer,
    textColor: theme.colors.onPrimaryContainer,
  };
  // The hook needs a valid status, so we provide a fallback for the 'all' case.
  const statusStyleHook = useStatus(status === "all" ? "registered" : status);
  const finalStyle =
    status === "all"
      ? defaultStyle
      : {
          bgColor: statusStyleHook.backgroundColor,
          textColor: statusStyleHook.color,
        };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: selected
              ? finalStyle.bgColor
              : theme.colors.surface,
            borderColor: selected ? finalStyle.bgColor : theme.colors.outline,
            borderWidth: 1,
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            {
              color: selected
                ? finalStyle.textColor
                : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function LaiveApplicant() {
  const theme = useTheme();
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | null>(
    null
  );
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [latestRecord, setLatestRecord] = useState<CandidateRecord | null>(
    null
  );

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCandidates();
      setCandidates(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestRecord = async (c: Candidate | null) => {
    if (!c) {
      setLatestRecord(null);
      return;
    }
    setIsDetailLoading(true);
    try {
      const recRes = await getCandidateRecords(c.PublicToken);
      const records: CandidateRecord[] = recRes.data ?? [];
      const latest =
        records
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0] ?? null;
      setLatestRecord(latest);
    } catch {
      setLatestRecord(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidate) {
      const freshCandidate = candidates.find(
        (c) => c.ID === selectedCandidate.ID
      );
      setSelectedCandidate(freshCandidate || null);
      fetchLatestRecord(freshCandidate || null);
    } else {
      setLatestRecord(null);
    }
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => !statusFilter || c.Status === statusFilter)
      .filter((c) => {
        if (!query) return true;
        const lowerQuery = query.toLowerCase();
        return (
          c.FullName.toLowerCase().includes(lowerQuery) ||
          c.Email.toLowerCase().includes(lowerQuery)
        );
      });
  }, [candidates, query, statusFilter]);

  if (loading && !candidates.length) {
    return (
      <View style={styles.placeholderContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={{ fontSize: 18, marginBottom: 12, textAlign: "center" }}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => router.push("/")}>
          Back to Home
        </Button>
      </View>
    );
  }

  const canShowResult =
    !!selectedCandidate &&
    RESULT_VIEWABLE_STATUSES.includes(selectedCandidate.Status) &&
    !!latestRecord;

  return (
    <View style={{ flex: 1 }}>
      <Header page="All Applicants" showBack />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.leftColumn}>
          <View style={styles.toolbar}>
            <TextInput
              mode="outlined"
              placeholder="Search by name or email"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              left={<TextInput.Icon icon="magnify" />}
            />
            <View style={styles.viewSwitch}>
              <IconButton
                icon="view-grid-outline"
                selected={viewMode === "grid"}
                onPress={() => setViewMode("grid")}
              />
              <IconButton
                icon="view-list-outline"
                selected={viewMode === "list"}
                onPress={() => setViewMode("list")}
              />
            </View>
          </View>

          <View style={styles.filters}>
            <FilterPill
              label="All"
              status="all"
              selected={!statusFilter}
              onPress={() => setStatusFilter(null)}
            />
            {STATUS_FILTERS.map((status) => (
              <FilterPill
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                status={status}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(status)}
              />
            ))}
          </View>

          <Divider style={{ marginBottom: 12 }} />

          {filteredCandidates.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EmptyStateCard
                icon="account-search-outline"
                title=""
                message="No candidates match your filter criteria."
                suggestion="Try adjusting your search or register a new candidate."
              />
            </View>
          ) : viewMode === "grid" ? (
            <FlatList
              data={filteredCandidates}
              numColumns={2}
              key={"grid"}
              keyExtractor={(item) => String(item.ID)}
              columnWrapperStyle={{ gap: 12 }}
              style={{ gap: 12 }}
              renderItem={({ item }) => (
                <CandidateGridCard
                  item={item}
                  onSelect={(c) => {
                    setSelectedCandidate(c);
                    fetchLatestRecord(c);
                  }}
                  selected={selectedCandidate?.ID === item.ID}
                />
              )}
            />
          ) : (
            <FlatList
              data={filteredCandidates}
              key={"list"}
              keyExtractor={(item) => String(item.ID)}
              renderItem={({ item }) => (
                <CandidateListCard
                  item={item}
                  onSelect={(c) => {
                    setSelectedCandidate(c);
                    fetchLatestRecord(c);
                  }}
                  selected={selectedCandidate?.ID === item.ID}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>

        <View
          style={[
            styles.rightColumn,
            { borderLeftColor: theme.colors.outlineVariant },
          ]}
        >
          {isDetailLoading && (
            <View style={styles.detailOverlay}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {selectedCandidate ? (
            <ScrollView>
              <SectionHeader title="Candidate Details" />
              <CandidateDetailCard candidate={selectedCandidate} />

              {canShowResult && latestRecord && (
                <>
                  <SectionHeader
                    title="Result Summary"
                    action={
                      <Button
                        mode="contained-tonal"
                        icon="poll"
                        onPress={() =>
                          router.push(
                            `/c/result/${selectedCandidate.PublicToken}`
                          )
                        }
                      >
                        View Full Result
                      </Button>
                    }
                  />
                  <ResultSummaryCard
                    candidate={selectedCandidate}
                    record={latestRecord}
                  />
                </>
              )}

              <SectionHeader title="Actions" />
              <CandidateActionsCard
                candidate={selectedCandidate}
                onActionSuccess={fetchCandidates}
                setLoading={setIsDetailLoading}
              />
            </ScrollView>
          ) : (
            <Placeholder />
          )}
        </View>
      </View>
    </View>
  );
}

// --- Detail View Components ---

const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      paddingHorizontal: 4,
    }}
  >
    <Text variant="titleLarge" style={{ fontWeight: "600" }}>
      {title}
    </Text>
    {action}
  </View>
);

const Placeholder = () => {
  const theme = useTheme();
  return (
    <View style={styles.placeholderContainer}>
      <Card
        style={[
          styles.placeholderCard,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content style={styles.placeholderContent}>
          <Avatar.Icon
            icon="cursor-default-click-outline"
            size={80}
            style={{
              marginBottom: 16,
              backgroundColor: theme.colors.background,
            }}
          />
          <Text style={styles.placeholderTitle}>Select a Candidate</Text>
          <Text style={styles.placeholderText}>
            Choose a candidate from the list to view their details and available
            actions.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | Date | null;
}) => {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: "gray", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16 }}>
        {value instanceof Date ? value.toLocaleString() : value}
      </Text>
    </View>
  );
};

function StatusPill({ status }: { status: CandidateStatus }) {
  const { backgroundColor, color } = useStatus(status);
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

const CandidateDetailCard = ({ candidate }: { candidate: Candidate }) => {
  const theme = useTheme();
  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <DetailRow label="Full Name" value={candidate.FullName} />
        <DetailRow label="Email" value={candidate.Email} />
        <DetailRow label="Role" value={candidate.Role} />
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{ fontSize: 12, color: "gray", textTransform: "uppercase" }}
          >
            Status
          </Text>
          <View style={{ marginTop: 4 }}>
            <StatusPill status={candidate.Status} />
          </View>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <DetailRow
          label="Registered"
          value={new Date(candidate.CreatedDateTime)}
        />
        {candidate.InviteSentAt && (
          <DetailRow label="Invited" value={new Date(candidate.InviteSentAt)} />
        )}
        {candidate.ExpiresAt && (
          <DetailRow label="Expires" value={new Date(candidate.ExpiresAt)} />
        )}
        {candidate.CompletedAt && (
          <DetailRow
            label="Completed"
            value={new Date(candidate.CompletedAt)}
          />
        )}
        {candidate.DecisionAt && (
          <DetailRow label="Decision" value={new Date(candidate.DecisionAt)} />
        )}
      </Card.Content>
    </Card>
  );
};

const ResultSummaryCard = ({
  candidate,
  record,
}: {
  candidate: Candidate;
  record: CandidateRecord;
}) => {
  const theme = useTheme();
  const rolefit = record.ra_rolefit_score ?? "-";
  const interview = record.int_average_score ?? "-";
  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content style={styles.summaryCardContent}>
        <View style={styles.summaryLeft}>
          <Text variant="labelLarge">Role Fit Score</Text>
          <Text variant="displayMedium" style={{ color: theme.colors.primary }}>
            {rolefit}
            <Text variant="headlineSmall">/10</Text>
          </Text>
        </View>
        <Divider style={styles.verticalDivider} />
        <View style={styles.summaryRight}>
          <Text variant="labelLarge">Interview Score</Text>
          <Text variant="displayMedium" style={{ color: theme.colors.primary }}>
            {interview}
            <Text variant="headlineSmall">/5</Text>
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const CandidateActionsCard = ({
  candidate,
  onActionSuccess,
  setLoading: setDetailLoading,
}: {
  candidate: Candidate;
  onActionSuccess: () => void;
  setLoading: (l: boolean) => void;
}) => {
  const theme = useTheme();
  const notification = useNotification();
  const [loading, setLoading] = useState(false);

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string
  ) => {
    setLoading(true);
    setDetailLoading(true);
    try {
      const res = await action();
      if (res.data.success) {
        notification.showToast(successMessage, { type: "success" });
        onActionSuccess();
      } else {
        throw new Error(res.data.error || "Action failed");
      }
    } catch (e: any) {
      notification.showToast(e.response?.data?.error || e.message, {
        type: "error",
      });
    }
    setLoading(false);
    setDetailLoading(false);
  };

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ gap: 8 }}>
        <Button
          mode="contained"
          icon="email-fast-outline"
          disabled={candidate.Status !== INVITEABLE_STATUS || loading}
          onPress={() =>
            handleAction(
              () => inviteCandidate(candidate.PublicToken),
              "Invitation sent!"
            )
          }
        >
          Invite
        </Button>
        <Button
          mode="contained-tonal"
          icon="check-circle-outline"
          disabled={candidate.Status !== DECISION_MAKING_STATUS || loading}
          onPress={() =>
            handleAction(
              () =>
                updateCandidateStatus(candidate.PublicToken, {
                  status: "passed",
                }),
              "Candidate marked as passed"
            )
          }
        >
          Mark as Passed
        </Button>
        <Button
          mode="contained-tonal"
          icon="close-circle-outline"
          disabled={candidate.Status !== DECISION_MAKING_STATUS || loading}
          onPress={() =>
            handleAction(
              () =>
                updateCandidateStatus(candidate.PublicToken, {
                  status: "rejected",
                }),
              "Candidate marked as rejected"
            )
          }
        >
          Mark as Rejected
        </Button>
      </Card.Content>
    </Card>
  );
};

const CandidateGridCard = ({
  item,
  onSelect,
  selected,
}: {
  item: Candidate;
  onSelect: (c: Candidate) => void;
  selected: boolean;
}) => {
  const theme = useTheme();
  return (
    <Card
      style={[
        {
          flex: 1,
          backgroundColor: selected
            ? theme.colors.primaryContainer
            : theme.colors.surface,
        },
        selected && { borderColor: theme.colors.primary, borderWidth: 1 },
      ]}
      onPress={() => onSelect(item)}
    >
      <Card.Content style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar.Text
            size={40}
            label={item.ByName?.charAt(0) || item.FullName.charAt(0)}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700" }} numberOfLines={1}>
              {item.FullName}
            </Text>
            <Text
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {item.Role}
            </Text>
          </View>
          <StatusPill status={item.Status} />
        </View>
      </Card.Content>
    </Card>
  );
};

const CandidateListCard = ({
  item,
  onSelect,
  selected,
}: {
  item: Candidate;
  onSelect: (c: Candidate) => void;
  selected: boolean;
}) => {
  const theme = useTheme();
  return (
    <Card
      style={[
        {
          backgroundColor: selected
            ? theme.colors.primaryContainer
            : theme.colors.surface,
        },
        selected && { borderColor: theme.colors.primary, borderWidth: 2 },
      ]}
      onPress={() => onSelect(item)}
    >
      <Card.Content
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <Avatar.Text
          size={44}
          label={item.ByName?.charAt(0) || item.FullName.charAt(0)}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700" }} numberOfLines={1}>
            {item.FullName}
          </Text>
          <Text
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            {item.Role}
          </Text>
        </View>
        <StatusPill status={item.Status} />
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
          {new Date(item.CreatedDateTime).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    paddingRight: 16,
    gap: 16,
  },
  leftColumn: { flex: 2, paddingLeft: 16 },
  rightColumn: { flex: 3, borderLeftWidth: 1, paddingLeft: 16 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  search: { flex: 1 },
  viewSwitch: { flexDirection: "row", alignItems: "center" },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: { borderRadius: 999 },
  emptyCard: { paddingVertical: 32, borderRadius: 16, marginTop: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyMessage: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  emptyActions: { flexDirection: "row", gap: 12 },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  placeholderCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 12,
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholderText: {
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },

  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLeft: {
    alignItems: "center",
  },
  summaryRight: {
    alignItems: "center",
  },
  verticalDivider: {
    height: "100%",
    width: 1,
  },
  pill: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
