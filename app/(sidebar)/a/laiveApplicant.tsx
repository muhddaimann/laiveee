import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
  Chip,
  TextInput,
  IconButton,
  FAB,
  Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Header from "../../../components/layout/header";

export default function LaiveApplicant() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [role, setRole] = useState<string | null>(null);
  const candidates: any[] = [];

  return (
    <View style={{ flex: 1 }}>
      <Header title="LaiveApplicant™" showBack />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.toolbar}>
          <TextInput
            mode="outlined"
            placeholder="Search candidates"
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
          <Chip
            selected={!role}
            onPress={() => setRole(null)}
            style={styles.chip}
            icon="checkbox-blank-circle-outline"
          >
            All
          </Chip>
          <Chip
            selected={role === "Customer Service"}
            onPress={() => setRole("Customer Service")}
            style={styles.chip}
            icon="headset"
          >
            Customer Service
          </Chip>
          <Chip
            selected={role === "Sales"}
            onPress={() => setRole("Sales")}
            style={styles.chip}
            icon="badge-account"
          >
            Sales
          </Chip>
          <Chip
            selected={role === "Tech Support"}
            onPress={() => setRole("Tech Support")}
            style={styles.chip}
            icon="laptop"
          >
            Tech Support
          </Chip>
          <Button
            mode="text"
            style={{ marginLeft: "auto" }}
            icon="tune-variant"
          >
            More
          </Button>
        </View>

        <Divider style={{ marginBottom: 12 }} />

        {candidates.length === 0 ? (
          <EmptyState
            title="No applicants yet"
            message="When candidates are registered or invited, they will appear here for interview scheduling and tracking."
            primaryCta="Register Candidate"
            onPrimary={() => router.push("a/laiveRegister")}
            secondaryCta="Configure Intake"
            onSecondary={() => router.push("a/laiveConfigure")}
          />
        ) : viewMode === "grid" ? (
          <FlatList
            data={candidates}
            numColumns={3}
            key={"grid"}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingBottom: 108 }}
            style={{ gap: 12 }}
            renderItem={({ item }) => <CandidateGridCard item={item} />}
          />
        ) : (
          <FlatList
            data={candidates}
            key={"list"}
            contentContainerStyle={{ paddingBottom: 108 }}
            renderItem={({ item }) => <CandidateListCard item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        <FAB
          icon="account-plus"
          label="New"
          onPress={() => router.push("a/laiveRegister")}
          style={styles.fab}
        />
      </View>
    </View>
  );
}

function EmptyState({
  title,
  message,
  primaryCta,
  onPrimary,
  secondaryCta,
  onSecondary,
}: {
  title: string;
  message: string;
  primaryCta: string;
  onPrimary: () => void;
  secondaryCta: string;
  onSecondary: () => void;
}) {
  const theme = useTheme();
  return (
    <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={{ alignItems: "center" }}>
        <Avatar.Icon
          icon="account-search-outline"
          size={72}
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            marginBottom: 12,
          }}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.emptyMessage,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>
        <View style={styles.emptyActions}>
          <Button mode="contained" onPress={onPrimary} icon="account-plus">
            {primaryCta}
          </Button>
          <Button mode="outlined" onPress={onSecondary} icon="cog-outline">
            {secondaryCta}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

function CandidateGridCard({ item }: { item: any }) {
  const theme = useTheme();
  return (
    <Card style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar.Icon icon="account" size={40} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700" }} numberOfLines={1}>
              {item?.name}
            </Text>
            <Text
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {item?.role}
            </Text>
          </View>
          <Chip compact>{item?.stage ?? "—"}</Chip>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip compact icon="star-outline">
            {item?.score ?? "-"}
          </Chip>
          <Chip compact icon="calendar-clock">
            {item?.updatedAt ?? "-"}
          </Chip>
        </View>
        <Button mode="contained" icon="message-text-outline">
          Open
        </Button>
      </Card.Content>
    </Card>
  );
}

function CandidateListCard({ item }: { item: any }) {
  const theme = useTheme();
  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <Avatar.Icon icon="account" size={44} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700" }} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            {item?.role}
          </Text>
        </View>
        <Chip compact>{item?.stage ?? "—"}</Chip>
        <Button mode="text" icon="chevron-right">
          View
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
  emptyCard: { paddingVertical: 32, borderRadius: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyMessage: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  emptyActions: { flexDirection: "row", gap: 12 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
