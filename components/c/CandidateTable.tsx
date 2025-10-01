import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Candidate, getLatestCandidates } from '../../contexts/api/candidate';
import EmptyStateCard from './EmptyStateCard';

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
        <EmptyStateCard
          title=""
          icon="account-search-outline"
          message="No candidates found"
          suggestion="Register a new candidate to get started."
        />
      ) : (
        <Card
          style={[styles.largeCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Candidate</Text>
              <Text style={styles.tableHeaderText}>Role</Text>
              <Text style={styles.tableHeaderText}>Action</Text>
            </View>

            {candidates.map((candidate) => (
              <View key={candidate.ID} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {candidate.FullName}
                </Text>
                <Text style={styles.tableCell}>
                  {candidate.Role}
                </Text>
                <Button mode="contained" onPress={() => onSelect(candidate)}>
                  View
                </Button>
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
  },
  tableHeaderText: { fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: { flex: 1 },
});

export default CandidateTable;
