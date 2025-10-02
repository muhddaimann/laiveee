import React from 'react';
import { Card, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

function LookupCard({ onSearch }: { onSearch: (id: string) => void }) {
  const [id, setId] = React.useState('');
  const theme = useTheme();
  return (
    <Card style={[styles.rightCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text style={styles.cardTitle}>Candidate Lookup</Text>
        <TextInput
          mode="outlined"
          label="Enter Candidate ID"
          value={id}
          onChangeText={setId}
          style={styles.lookupInput}
        />
        <Button mode="contained" onPress={() => onSearch(id)} disabled={!id}>
          Search
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  rightCard: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  lookupInput: { marginBottom: 12 },
});

export default LookupCard;
