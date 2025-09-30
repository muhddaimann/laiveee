import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert, ScrollView, ActivityIndicator } from "react-native";
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
  Menu,
} from "react-native-paper";
import Header from "../../../components/c/header";
import { useNotification } from "../../../contexts/notificationContext";
import {
  JobRole,
  JobRoleStatus,
  getAllJobRoles,
  createJobRole,
  updateJobRole,
  deleteJobRole,
  CreateJobRolePayload,
  UpdateJobRolePayload,
} from "../../../contexts/api/jobRole";
import { useRoleOptions } from "../../../hooks/useRole";

const PAGE_SIZE = 5;

// --- MAIN COMPONENT --- //
export default function LaiveRolePage() {
  const theme = useTheme();
  const notification = useNotification();
  const { statuses } = useRoleOptions();

  // API State
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobRoleStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA FETCHING ---
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllJobRoles(statusFilter || undefined);
      
      // Parse JSON string fields into arrays
      const parsedRoles = res.data.map(role => ({
        ...role,
        Responsibilities: typeof role.Responsibilities === 'string' ? JSON.parse(role.Responsibilities) : (role.Responsibilities || []),
        Qualifications: typeof role.Qualifications === 'string' ? JSON.parse(role.Qualifications) : (role.Qualifications || []),
        Benefits: typeof role.Benefits === 'string' ? JSON.parse(role.Benefits) : (role.Benefits || []),
      }));

      setRoles(parsedRoles);
      setError(null);
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || "Failed to fetch roles.";
      setError(errorMessage);
      notification.showToast(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, notification]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- DERIVED STATE ---
  const selectedRole = useMemo(
    () => roles.find((r) => r.Code === selectedRoleCode) || null,
    [roles, selectedRoleCode]
  );

  const filteredRoles = useMemo(
    () =>
      roles.filter((r) =>
        r.Title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [roles, searchQuery]
  );

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, currentPage]);

  const totalPages = Math.ceil(filteredRoles.length / PAGE_SIZE);

  // --- HANDLERS ---
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
    if (isCreating) {
      setIsCreating(false);
    }
    setViewMode("preview");
  };

  const handleSave = async (roleData: CreateJobRolePayload | UpdateJobRolePayload) => {
    try {
      let savedRole: JobRole;
      if (isCreating) {
        const res = await createJobRole(roleData as CreateJobRolePayload);
        savedRole = res.data;
        notification.showToast("Role created successfully!", { type: "success" });
      } else if (selectedRole) {
        const res = await updateJobRole(selectedRole.Code, roleData as UpdateJobRolePayload);
        savedRole = res.data;
        notification.showToast("Role updated successfully!", { type: "success" });
      } else {
        return;
      }
      await fetchRoles();
      setSelectedRoleCode(savedRole.Code);
      setViewMode("preview");
      setIsCreating(false);
    } catch (e: any) {
      notification.showToast(e.response?.data?.error || "Failed to save role.", { type: "error" });
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteJobRole(code);
      notification.showToast("Role deleted.", { type: "info" });
      setSelectedRoleCode(null);
      setIsCreating(false);
      await fetchRoles();
    } catch (e: any) {
      notification.showToast(e.response?.data?.error || "Failed to delete role.", { type: "error" });
    }
  };

  // --- RENDER ---
  if (loading && !roles.length) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 8 }}>Loading Roles...</Text>
      </View>
    );
  }

  if (error && !roles.length) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text>
        <Button onPress={fetchRoles} style={{ marginTop: 16 }}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header page="Manage Job Roles" showBack />
      <View style={styles.container}>
        {/* Left Column */}
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
            <Button mode="contained" onPress={handleAddNew} style={styles.newRoleButton} icon="plus">
              New Role
            </Button>
          </View>
          <View style={styles.filterContainer}>
            <Chip icon="format-list-bulleted" selected={!statusFilter} onPress={() => setStatusFilter(null)}>All</Chip>
            {statuses.map(status => (
              <Chip key={status} selected={statusFilter === status} onPress={() => setStatusFilter(status as JobRoleStatus)}>{status}</Chip>
            ))}
          </View>
          <FlatList
            data={paginatedRoles}
            keyExtractor={(item) => item.Code}
            renderItem={({ item }) => (
              <RoleListItem role={item} isSelected={selectedRoleCode === item.Code} onSelect={handleSelectRole} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={<EmptyListPlaceholder />}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 8 }}
          />
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </View>

        {/* Right Column */}
        <View style={[styles.rightColumn, { borderLeftColor: theme.colors.outlineVariant }]}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {selectedRole && viewMode === "preview" && (
              <RolePreview role={selectedRole} onEdit={() => setViewMode("edit")} onDelete={handleDelete} />
            )}
            {(isCreating || (selectedRole && viewMode === "edit")) && (
              <RoleForm initialRole={selectedRole} onSave={handleSave} onCancel={handleCancel} isCreating={isCreating} />
            )}
            {!selectedRole && !isCreating && <Placeholder />}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

// --- CHILD COMPONENTS ---

const RoleListItem = ({ role, isSelected, onSelect }: { role: JobRole, isSelected: boolean, onSelect: (code: string) => void }) => {
  const theme = useTheme();
  return (
    <Card
      style={{ backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface }}
      onPress={() => onSelect(role.Code)}
    >
      <Card.Content style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" numberOfLines={1}>{role.Title}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{role.Code}</Text>
        </View>
        <Chip>{role.Status}</Chip>
      </Card.Content>
    </Card>
  );
};

const RolePreview = ({ role, onEdit, onDelete }: { role: JobRole, onEdit: () => void, onDelete: (code: string) => void }) => {
  const theme = useTheme();

  const confirmDelete = () => {
    Alert.alert(
      "Delete Role",
      `Are you sure you want to delete "${role.Title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(role.Code) },
      ]
    );
  };

  return (
    <View>
      <Card style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}>
        <Card.Title
          title={role.Title}
          subtitle={`Dept: ${role.Department || 'N/A'} | Level: ${role.Level || 'N/A'}`}
          right={(props) => (
            <View {...props} style={{ flexDirection: "row", gap: 8, marginRight: 16 }}>
              <Button mode="contained-tonal" icon="pencil" onPress={onEdit}>Edit</Button>
              <Button mode="contained" buttonColor={theme.colors.errorContainer} textColor={theme.colors.onErrorContainer} icon="delete" onPress={confirmDelete}>Delete</Button>
            </View>
          )}
        />
        <Card.Content>
          <Text variant="bodyMedium">{role.Description}</Text>
        </Card.Content>
      </Card>

      <Card style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}>
        <List.Section title="Responsibilities">
          {role.Responsibilities.map((item, index) => (
            <List.Item key={index} title={item} titleNumberOfLines={3} left={() => <List.Icon icon="chevron-right" />} />
          ))}
        </List.Section>
      </Card>

      <Card style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}>
        <List.Section title="Qualifications">
          {role.Qualifications.map((item, index) => (
            <List.Item key={index} title={item} titleNumberOfLines={3} left={() => <List.Icon icon="chevron-right" />} />
          ))}
        </List.Section>
      </Card>

      <Card style={{ backgroundColor: theme.colors.surface }}>
        <List.Section title="Benefits">
          {role.Benefits.map((item, index) => (
            <List.Item key={index} title={item} titleNumberOfLines={3} left={() => <List.Icon icon="chevron-right" />} />
          ))}
        </List.Section>
      </Card>
    </View>
  );
};

const RoleForm = ({ initialRole, onSave, onCancel, isCreating }: { initialRole: JobRole | null, onSave: (data: CreateJobRolePayload | UpdateJobRolePayload) => void, onCancel: () => void, isCreating: boolean }) => {
  const theme = useTheme();
  const notification = useNotification();
  const { departments, levels, statuses } = useRoleOptions();

  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [levelMenuVisible, setLevelMenuVisible] = useState(false);

  const [title, setTitle] = useState(initialRole?.Title || "");
  const [code, setCode] = useState(initialRole?.Code || "");
  const [department, setDepartment] = useState(initialRole?.Department || "");
  const [level, setLevel] = useState(initialRole?.Level || "");
  const [description, setDescription] = useState(initialRole?.Description || "");
  const [status, setStatus] = useState<JobRoleStatus>(initialRole?.Status || "Draft");
  const [responsibilities, setResponsibilities] = useState(initialRole?.Responsibilities.join("\n") || "");
  const [qualifications, setQualifications] = useState(initialRole?.Qualifications.join("\n") || "");
  const [benefits, setBenefits] = useState(initialRole?.Benefits.join("\n") || "");

  const handleSave = () => {
    if (!title || !code) {
      notification.showToast("Title and Code are required.", { type: "error" });
      return;
    }
    const payload = {
      Title: title,
      Code: code,
      Department: department,
      Level: level,
      Description: description,
      Status: status,
      Responsibilities: responsibilities.split("\n").filter(s => s),
      Qualifications: qualifications.split("\n").filter(s => s),
      Benefits: benefits.split("\n").filter(s => s),
    };
    onSave(payload);
  };

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Title title={isCreating ? "Create New Role" : "Edit Role"} />
      <Card.Content>
        <TextInput mode="outlined" label="Role Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput mode="outlined" label="Role Code" value={code} onChangeText={setCode} disabled={!isCreating} style={styles.input} />
        
        <Menu
          visible={departmentMenuVisible}
          onDismiss={() => setDepartmentMenuVisible(false)}
          anchor={<Button style={styles.input} contentStyle={{justifyContent: 'flex-start'}}  mode="outlined" onPress={() => setDepartmentMenuVisible(true)}>{department || 'Select Department'}</Button>}>
          <ScrollView style={{ maxHeight: 200 }}>
            {departments.map(d => <Menu.Item key={d} onPress={() => { setDepartment(d as string); setDepartmentMenuVisible(false); }} title={d} />)}
          </ScrollView>
        </Menu>

        <Menu
          visible={levelMenuVisible}
          onDismiss={() => setLevelMenuVisible(false)}
          anchor={<Button style={styles.input} contentStyle={{justifyContent: 'flex-start'}} mode="outlined" onPress={() => setLevelMenuVisible(true)}>{level || 'Select Level'}</Button>}>
          {levels.map(l => <Menu.Item key={l} onPress={() => { setLevel(l as string); setLevelMenuVisible(false); }} title={l} />)}
        </Menu>

        <TextInput mode="outlined" label="Description" value={description || ''} onChangeText={setDescription} multiline numberOfLines={3} style={styles.input} />
        <View style={styles.statusContainer}>
          <Text>Status:</Text>
          {statuses.map(s => (
            <Chip key={s} selected={status === s} onPress={() => setStatus(s as JobRoleStatus)} style={styles.chip}>{s}</Chip>
          ))}
        </View>
        <Divider style={{ marginVertical: 16 }} />
        <TextInput mode="outlined" label="Responsibilities (one per line)" value={responsibilities} onChangeText={setResponsibilities} multiline numberOfLines={5} style={styles.input} />
        <TextInput mode="outlined" label="Qualifications (one per line)" value={qualifications} onChangeText={setQualifications} multiline numberOfLines={5} style={styles.input} />
        <TextInput mode="outlined" label="Benefits (one per line)" value={benefits} onChangeText={setBenefits} multiline numberOfLines={5} style={styles.input} />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <View style={{ flex: 1 }} />
        <Button onPress={onCancel}>Cancel</Button>
        <Button mode="contained" icon="check" onPress={handleSave}>Save</Button>
      </Card.Actions>
    </Card>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => (
  <View style={styles.paginationContainer}>
    <Button icon="chevron-left" disabled={currentPage <= 1} onPress={() => onPageChange(currentPage - 1)}>Prev</Button>
    <Text>Page {currentPage} of {totalPages}</Text>
    <Button icon="chevron-right" disabled={currentPage >= totalPages} onPress={() => onPageChange(currentPage + 1)}>Next</Button>
  </View>
);

const Placeholder = () => (
  <View style={styles.placeholderContainer}>
    <Avatar.Icon icon="briefcase-edit-outline" size={80} style={{ marginBottom: 16 }} />
    <Text style={{ fontSize: 18, fontWeight: "500" }}>Manage Roles</Text>
    <Text style={{ color: "gray", textAlign: "center", marginTop: 4 }}>
      Select a role from the list to preview and edit its details, or create a new one.
    </Text>
  </View>
);

const EmptyListPlaceholder = () => (
  <View style={styles.placeholderContainer}>
    <Avatar.Icon icon="briefcase-search-outline" size={80} style={{ marginBottom: 16, marginTop: 32 }} />
    <Text style={{ fontSize: 18, fontWeight: "500" }}>No Roles Found</Text>
    <Text style={{ color: "gray", textAlign: "center", marginTop: 4 }}>
      Your search or filter returned no results. Try adjusting your criteria or create a new role.
    </Text>
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", padding: 16, gap: 16 },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  leftColumn: { flex: 2, gap: 8 },
  rightColumn: { flex: 3, borderLeftWidth: 1, paddingLeft: 16 },
  toolbar: { flexDirection: "row", alignItems: "center", gap: 8 },
  newRoleButton: { height: 50, justifyContent: "center" },
  filterContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 8 },
  placeholderContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, height: "100%" },
  input: { marginBottom: 12 },
  statusContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  chip: { borderRadius: 8 },
  actions: { padding: 16, justifyContent: "flex-end", flexDirection: "row", gap: 8 },
  listItem: { marginLeft: 8, marginBottom: 4 },
  paginationContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
});
