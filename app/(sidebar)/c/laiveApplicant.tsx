import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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
  getCandidateById,
  getCandidateRecords,
  Candidate,
  CandidateStatus,
  CandidateRecord,
} from "../../../contexts/api/candidate";
import { useNotification } from "../../../contexts/notificationContext";
import EmptyStateCard from "../../../components/c/EmptyStateCard";
import { useStatus } from "../../../hooks/useStatus";
import RightColumnView from "../../../components/c/views/RightColumnView";

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
  const notification = useNotification();
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

  const fetchDetailsForSelectedCandidate = async (candidate: Candidate | null) => {
    if (!candidate) {
      setLatestRecord(null);
      return;
    }
    setIsDetailLoading(true);
    try {
      const [fullCandidateRes, recordsRes] = await Promise.all([
        getCandidateById(candidate.ID),
        getCandidateRecords(candidate.PublicToken),
      ]);

      const fullCandidate = fullCandidateRes.data;
      const records: CandidateRecord[] = recordsRes.data ?? [];
      const latest =
        records
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0] ?? null;

      setSelectedCandidate(fullCandidate); // Update with the full object
      setLatestRecord(latest);
    } catch (err) {
      notification.showToast("Failed to load candidate details.", { type: "error" });
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidate) {
      const freshCandidateInList = candidates.find(
        (c) => c.ID === selectedCandidate.ID
      );
      // If the candidate is still in the list (e.g. after a refresh), re-fetch its full details.
      if (freshCandidateInList) {
        fetchDetailsForSelectedCandidate(freshCandidateInList);
      } else {
        // The candidate is no longer in the list (e.g. deleted), so clear the selection.
        setSelectedCandidate(null);
        setLatestRecord(null);
      }
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
                    fetchDetailsForSelectedCandidate(c);
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
                    fetchDetailsForSelectedCandidate(c);
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
          <RightColumnView
            isDetailLoading={isDetailLoading}
            selectedCandidate={selectedCandidate}
            latestRecord={latestRecord}
            onActionSuccess={fetchCandidates}
            setLoading={setIsDetailLoading}
          />
        </View>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: CandidateStatus }) {
  const { backgroundColor, color } = useStatus(status);
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

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
            ? theme.colors.surface
            : theme.colors.surface,
        },
        selected && { borderColor: theme.colors.outline, borderWidth: 2 },
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
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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

