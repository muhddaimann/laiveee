import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Candidate, getLatestCandidates } from '../../contexts/api/candidate';
import EmptyStateCard from './EmptyStateCard';
import { useStatus } from '../../hooks/useStatus';

function SectionHeader({ title }: { title: string }) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
        paddingHorizontal: 8,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>
      <Button
        mode="text"
        onPress={() => router.push("c/laiveApplicant")}
        icon="chevron-right"
        contentStyle={{ flexDirection: "row-reverse", alignItems: "center" }}
        labelStyle={{ fontSize: 14, color: theme.colors.primary }}
      >
        View all
      </Button>
    </View>
  );
}

function StatusPill({ status }: { status: Candidate['Status'] }) {
  const { backgroundColor, color } = useStatus(status);
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
    </View>
  );
}

function CandidateTable({
  onSelect,
}: {
  onSelect: (candidate: Candidate) => void;
}) {
  const theme = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestCandidates()
      .then(response => {
        setCandidates(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch latest candidates:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <>
      <SectionHeader title="Latest Candidates" />
      {candidates.length === 0 ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <EmptyStateCard
            title=""
            icon="account-search-outline"
            message="No candidates have been registered yet."
            suggestion="Register a new candidate to see them appear here."
          />
        </View>
      ) : (
        <Card
          style={[styles.largeCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Candidate</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Role</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date Added</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.7, textAlign: 'right' }]}>Action</Text>
            </View>

            {candidates.map((candidate) => (
              <View key={candidate.ID} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.cellMainText}>{candidate.FullName}</Text>
                  <Text style={styles.cellSubText}>{candidate.Email}</Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {candidate.Role}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {new Date(candidate.CreatedDateTime).toLocaleDateString()}
                </Text>
                <View style={[styles.tableCell, { flex: 1, alignItems: 'flex-start' }]}>
                  <StatusPill status={candidate.Status} />
                </View>
                <View style={{ flex: 0.7, alignItems: 'flex-end' }}>
                  <Button mode="contained" onPress={() => onSelect(candidate)}>
                    View
                  </Button>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  largeCard: { paddingHorizontal: 16 },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  tableHeaderText: { fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  tableCell: { flex: 1 },
  cellMainText: { fontWeight: '500' },
  cellSubText: { fontSize: 12, color: 'gray' },
  pill: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default CandidateTable;
