import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Card, Text, Avatar, useTheme } from "react-native-paper";
import {
  Candidate,
  getLatestCompletedCandidates,
} from "../../contexts/api/candidate";
import EmptyStateCard from "./EmptyStateCard";

function RecentCard({
  onSelect,
}: {
  onSelect: (candidate: Candidate) => void;
}) {
  const theme = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestCompletedCandidates()
      .then((response) => {
        setCandidates(response.data.slice(0, 5));
      })
      .catch((err) => {
        console.error("Failed to fetch recent completed candidates:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Text style={styles.sectionTitle}>Recently Completed</Text>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 40 }} />
      ) : candidates.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <EmptyStateCard
            title=""
            icon="clock-alert-outline"
            message="No candidates found"
            suggestion="Completed interviews will appear here."
          />
        </View>
      ) : (
        candidates.map((candidate) => (
          <Card
            key={candidate.ID}
            style={[
              styles.rightCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <TouchableOpacity onPress={() => onSelect(candidate)}>
              <Card.Content style={styles.recentContent}>
                <Avatar.Icon
                  icon="account-check"
                  size={40}
                  style={[
                    styles.recentAvatar,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                  color={theme.colors.primary}
                />
                <View style={styles.recentTextContainer}>
                  <Text style={styles.candidateName}>{candidate.FullName}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {candidate.Role}
                  </Text>
                </View>
              </Card.Content>
            </TouchableOpacity>
          </Card>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  rightCard: { marginBottom: 12 },
  recentContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  recentAvatar: { marginRight: 12 },
  recentTextContainer: { flex: 1, alignItems: "flex-end" },
  candidateName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default RecentCard;
