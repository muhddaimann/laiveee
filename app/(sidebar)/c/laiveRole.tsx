import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Alert, ScrollView } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme,
  Avatar,
  TextInput,
  Chip,
  Divider,
  List,
} from "react-native-paper";
import Header from "../../../components/c/header";
import { useNotification } from "../../../contexts/notificationContext";

interface JobRole {
  code: string;
  title: string;
  description: string;
  status: "active" | "inactive";
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}

const PAGE_SIZE = 5;

export default function LaiveRolePage() {
  const theme = useTheme();
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedRole = useMemo(
    () => roles.find((r) => r.code === selectedRoleCode) || null,
    [roles, selectedRoleCode]
  );

  const filteredRoles = useMemo(
    () =>
      roles
        .filter((r) => !statusFilter || r.status === statusFilter)
        .filter((r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [roles, searchQuery, statusFilter]
  );

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, currentPage]);

  const totalPages = Math.ceil(filteredRoles.length / PAGE_SIZE);

  const handleSelectRole = (code: string) => {
    if (selectedRoleCode === code) {
      setSelectedRoleCode(null);
    } else {
      setIsCreating(false);
      setViewMode("preview");
      setSelectedRoleCode(code);
    }
  };

  const handleAddNew = () => {
    setSelectedRoleCode(null);
    setIsCreating(true);
    setViewMode("edit");
  };

  const handleCancel = () => {
    if (isCreating) setIsCreating(false);
    setViewMode("preview");
  };

  const handleSave = (role: JobRole) => {
    if (isCreating) {
      setRoles((prev) => [role, ...prev]);
    } else {
      setRoles((prev) => prev.map((r) => (r.code === role.code ? role : r)));
    }
    setSelectedRoleCode(role.code);
    setViewMode("preview");
    setIsCreating(false);
  };

  const handleDelete = (code: string) => {
    setRoles((prev) => prev.filter((r) => r.code !== code));
    setSelectedRoleCode(null);
    setIsCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header page="Manage Job Roles" showBack />
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <View style={styles.toolbar}>
            <TextInput
              mode="outlined"
              placeholder="Search roles..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1 }}
              left={<TextInput.Icon icon="magnify" />}
            />
            <Button
              mode="contained"
              onPress={handleAddNew}
              style={styles.newRoleButton}
              icon="plus"
            >
              New Role
            </Button>
          </View>
          <View style={styles.filterContainer}>
            <Chip
              icon="format-list-bulleted"
              selected={!statusFilter}
              onPress={() => setStatusFilter(null)}
            >
              All
            </Chip>
            <Chip
              icon="check-circle-outline"
              selected={statusFilter === "active"}
              onPress={() => setStatusFilter("active")}
            >
              Active
            </Chip>
            <Chip
              icon="close-circle-outline"
              selected={statusFilter === "inactive"}
              onPress={() => setStatusFilter("inactive")}
            >
              Inactive
            </Chip>
          </View>
          <FlatList
            data={paginatedRoles}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <RoleListItem
                role={item}
                isSelected={selectedRoleCode === item.code}
                onSelect={handleSelectRole}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={<EmptyListPlaceholder />}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 8 }}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </View>

        <View
          style={[
            styles.rightColumn,
            { borderLeftColor: theme.colors.outlineVariant },
          ]}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {selectedRole && viewMode === "preview" && (
              <RolePreview
                role={selectedRole}
                onEdit={() => setViewMode("edit")}
                onDelete={handleDelete}
              />
            )}
            {(isCreating || (selectedRole && viewMode === "edit")) && (
              <RoleForm
                initialRole={selectedRole}
                onSave={handleSave}
                onCancel={handleCancel}
                isCreating={isCreating}
              />
            )}
            {!selectedRole && !isCreating && <Placeholder />}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const RoleListItem = ({
  role,
  isSelected,
  onSelect,
}: {
  role: JobRole;
  isSelected: boolean;
  onSelect: (code: string) => void;
}) => {
  const theme = useTheme();
  return (
    <Card
      style={{
        backgroundColor: isSelected
          ? theme.colors.primaryContainer
          : theme.colors.surface,
      }}
      onPress={() => onSelect(role.code)}
    >
      <Card.Content
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" numberOfLines={1}>
            {role.title}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {role.code}
          </Text>
        </View>
        <Chip
          icon={role.status === "active" ? "check-circle" : "close-circle"}
          selected={role.status === "active"}
        >
          {role.status}
        </Chip>
      </Card.Content>
    </Card>
  );
};

const RolePreview = ({
  role,
  onEdit,
  onDelete,
}: {
  role: JobRole;
  onEdit: () => void;
  onDelete: (code: string) => void;
}) => {
  const theme = useTheme();
  const notification = useNotification();

  const confirmDelete = () => {
    Alert.alert(
      "Delete Role",
      `Are you sure you want to delete "${role.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(role.code);
            notification.showToast("Role deleted.", { type: "info" });
          },
        },
      ]
    );
  };

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flexShrink: 1,
            }}
          >
            <Text variant="titleLarge" numberOfLines={1}>
              {role.title} #{role.code}
            </Text>
            <Chip
              icon={role.status === "active" ? "check-circle" : "close-circle"}
              selected={role.status === "active"}
            >
              {role.status}
            </Chip>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button mode="contained-tonal" icon="pencil" onPress={onEdit}>
              Edit
            </Button>
            <Button
              mode="contained"
              icon="delete"
              buttonColor={theme.colors.errorContainer}
              textColor={theme.colors.onErrorContainer}
              onPress={confirmDelete}
            >
              Delete
            </Button>
          </View>
        </View>

        {role.description?.trim()?.length ? (
          <View style={{ marginBottom: 12 }}>
            <Text variant="titleSmall" style={{ marginBottom: 4 }}>
              Description
            </Text>
            <Text variant="bodyMedium">{role.description}</Text>
          </View>
        ) : null}

        <Divider style={{ marginVertical: 8 }} />

        <List.Section title="Responsibilities">
          {role.responsibilities.map((item, idx) => (
            <List.Item
              key={`resp-${idx}`}
              title={item}
              titleNumberOfLines={3}
              left={() => <List.Icon icon="chevron-right" />}
            />
          ))}
        </List.Section>

        <Divider style={{ marginVertical: 8 }} />

        <List.Section title="Qualifications">
          {role.qualifications.map((item, idx) => (
            <List.Item
              key={`qual-${idx}`}
              title={item}
              titleNumberOfLines={3}
              left={() => <List.Icon icon="chevron-right" />}
            />
          ))}
        </List.Section>

        <Divider style={{ marginVertical: 8 }} />

        <List.Section title="Benefits">
          {role.benefits.map((item, idx) => (
            <List.Item
              key={`benefit-${idx}`}
              title={item}
              titleNumberOfLines={3}
              left={() => <List.Icon icon="chevron-right" />}
            />
          ))}
        </List.Section>
      </Card.Content>
    </Card>
  );
};

const RoleForm = ({
  initialRole,
  onSave,
  onCancel,
  isCreating,
}: {
  initialRole: JobRole | null;
  onSave: (role: JobRole) => void;
  onCancel: () => void;
  isCreating: boolean;
}) => {
  const theme = useTheme();
  const notification = useNotification();
  const [title, setTitle] = useState(initialRole?.title || "");
  const [code, setCode] = useState(initialRole?.code || "");
  const [description, setDescription] = useState(
    initialRole?.description || ""
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    initialRole?.status || "active"
  );
  const [responsibilities, setResponsibilities] = useState(
    initialRole?.responsibilities.join("\n") || ""
  );
  const [qualifications, setQualifications] = useState(
    initialRole?.qualifications.join("\n") || ""
  );
  const [benefits, setBenefits] = useState(
    initialRole?.benefits.join("\n") || ""
  );

  const handleSave = () => {
    if (!title || !code) {
      notification.showToast("Title and Code are required.", { type: "error" });
      return;
    }
    onSave({
      title,
      code,
      description,
      status,
      responsibilities: responsibilities.split("\n").filter((s) => s),
      qualifications: qualifications.split("\n").filter((s) => s),
      benefits: benefits.split("\n").filter((s) => s),
    });
    notification.showToast("Role saved successfully!", { type: "success" });
  };

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Title title={isCreating ? "Create New Role" : "Edit Role"} />
      <Card.Content>
        <TextInput
          mode="outlined"
          label="Role Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Role Code"
          value={code}
          onChangeText={setCode}
          disabled={!isCreating}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.statusContainer}>
          <Text>Status:</Text>
          <Chip
            selected={status === "active"}
            onPress={() => setStatus("active")}
            style={styles.chip}
          >
            Active
          </Chip>
          <Chip
            selected={status === "inactive"}
            onPress={() => setStatus("inactive")}
            style={styles.chip}
          >
            Inactive
          </Chip>
        </View>
        <Divider style={{ marginVertical: 16 }} />
        <TextInput
          mode="outlined"
          label="Responsibilities (one per line)"
          value={responsibilities}
          onChangeText={setResponsibilities}
          multiline
          numberOfLines={5}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Qualifications (one per line)"
          value={qualifications}
          onChangeText={setQualifications}
          multiline
          numberOfLines={5}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Benefits (one per line)"
          value={benefits}
          onChangeText={setBenefits}
          multiline
          numberOfLines={5}
          style={styles.input}
        />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <View style={{ flex: 1 }} />
        <Button onPress={onCancel}>Cancel</Button>
        <Button mode="contained" icon="check" onPress={handleSave}>
          Save
        </Button>
      </Card.Actions>
    </Card>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <View style={styles.paginationContainer}>
    <Button
      icon="chevron-left"
      disabled={currentPage <= 1}
      onPress={() => onPageChange(currentPage - 1)}
    >
      Prev
    </Button>
    <Text>
      Page {currentPage} of {totalPages}
    </Text>
    <Button
      icon="chevron-right"
      disabled={currentPage >= totalPages}
      onPress={() => onPageChange(currentPage + 1)}
    >
      Next
    </Button>
  </View>
);

const Placeholder = () => (
  <View style={styles.placeholderContainer}>
    <Avatar.Icon
      icon="briefcase-edit-outline"
      size={80}
      style={{ marginBottom: 16 }}
    />
    <Text style={{ fontSize: 18, fontWeight: "500" }}>Manage Roles</Text>
    <Text style={{ color: "gray", textAlign: "center", marginTop: 4 }}>
      Select a role from the list to preview and edit its details, or create a
      new one.
    </Text>
  </View>
);

const EmptyListPlaceholder = () => (
  <View style={styles.placeholderContainer}>
    <Avatar.Icon
      icon="briefcase-search-outline"
      size={80}
      style={{ marginBottom: 16, marginTop: 32 }}
    />
    <Text style={{ fontSize: 18, fontWeight: "500" }}>No Roles Found</Text>
    <Text style={{ color: "gray", textAlign: "center", marginTop: 4 }}>
      Your search or filter returned no results. Try adjusting your criteria or
      create a new role.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", padding: 16, gap: 16 },
  leftColumn: { flex: 2, gap: 8 },
  rightColumn: { flex: 3, borderLeftWidth: 1, paddingLeft: 16 },
  toolbar: { flexDirection: "row", alignItems: "center", gap: 8 },
  newRoleButton: { height: 50, justifyContent: "center" },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    height: "100%",
  },
  input: { marginBottom: 12 },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  chip: { borderRadius: 8 },
  actions: {
    padding: 16,
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  listItem: { marginLeft: 8, marginBottom: 4 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
});
