import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import Header from "../../../components/c/header";
import { useAuth } from "../../../contexts/cAuthContext";
import { getSelfDetails, Staff } from "../../../contexts/api/staff";
import {
  CandidateRecord,
  getCandidateById,
  getCandidateRecords,
  Candidate,
} from "../../../contexts/api/candidate";
import LookupCard from "../../../components/c/LookupCard";
import RecentCard from "../../../components/c/RecentCard";
import LoadingScreen from "../../../components/c/LoadingScreen";
import ProfileCard from "../../../components/c/ProfileCard";
import DashboardView from "../../../components/c/views/DashboardView";
import RegisterView from "../../../components/c/views/RegisterView";
import ReportView from "../../../components/c/views/ReportView";
import { useNotification } from "../../../contexts/notificationContext";

// ===== Main Dashboard Component =====
export default function Dashboard() {
  const notification = useNotification();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "report" | "register">(
    "dashboard"
  );
  const [selectedInfo, setSelectedInfo] = useState<{
    candidate: Candidate;
    record: CandidateRecord;
  } | null>(null);

  const { isAuthenticated } = useAuth();
  const [staffUser, setStaffUser] = useState<Staff | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getSelfDetails()
        .then(setStaffUser)
        .catch(() => setStaffUser(null));
    }
  }, [isAuthenticated]);

  const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      notification.showToast("Please enter a valid numeric Candidate ID.", {
        type: "error",
      });
      return;
    }

    setLoading(true);
    setViewMode("dashboard");
    try {
      const candidateRes = await getCandidateById(numericId);
      const candidate = candidateRes.data;
      if (candidate && candidate.PublicToken) {
        const recordsRes = await getCandidateRecords(candidate.PublicToken);
        const record = recordsRes.data?.[0];
        if (record) {
          setSelectedInfo({ candidate, record });
          setViewMode("report");
        } else {
          // If no record is found, still proceed to the report view.
          // The ReportView will show an appropriate empty state message.
          setSelectedInfo({ candidate, record: {} as CandidateRecord });
          setViewMode("report");
        }
      } else {
        throw new Error("Candidate not found.");
      }
    } catch (err) {
      notification.showToast("Candidate ID not found.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setLoading(true);
    setViewMode("dashboard");
    getCandidateRecords(candidate.PublicToken)
      .then((response) => {
        const record = response.data?.[0];
        setSelectedInfo({
          candidate,
          record: record || ({} as CandidateRecord),
        });
        setViewMode("report");
      })
      .catch((err) => {
        console.error(
          "Could not fetch candidate records, proceeding with empty state:",
          err
        );
        setSelectedInfo({ candidate, record: {} as CandidateRecord });
        setViewMode("report");
      })
      .finally(() => setLoading(false));
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingScreen />;
    }
    switch (viewMode) {
      case "register":
        return <RegisterView onClose={() => setViewMode("dashboard")} />;
      case "report":
        return (
          <ReportView
            candidate={selectedInfo!.candidate}
            candidateData={selectedInfo!.record}
            onBack={() => setViewMode("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardView
            onSelectCandidate={handleSelectCandidate}
            onRegisterPress={() => setViewMode("register")}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header page="Dashboard" />
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.left}>{renderContent()}</View>
        <View style={styles.right}>
          {staffUser ? (
            <ProfileCard
              name={staffUser.nick_name}
              designation="Recruiter"
              avatarLabel={staffUser.initials}
            />
          ) : (
            <ActivityIndicator style={{ marginVertical: 60 }} />
          )}
          <LookupCard onSearch={handleSearch} />
          <RecentCard onSelect={handleSelectCandidate} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  left: {
    flex: 4,
    borderRightWidth: 1,
    padding: 24,
    justifyContent: "flex-start",
  },
  right: { flex: 1, padding: 24, paddingTop: 60 },
});
