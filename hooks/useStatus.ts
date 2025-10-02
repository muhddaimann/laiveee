import { useTheme } from "react-native-paper";
import { CandidateStatus } from "../contexts/api/candidate";

interface StatusStyle {
  backgroundColor: string;
  color: string;
}

export const useStatus = (status: CandidateStatus): StatusStyle => {
  const theme = useTheme();

  switch (status) {
    case "passed":
      return {
        backgroundColor: theme.colors.tertiaryContainer,
        color: theme.colors.onTertiaryContainer,
      };
    case "rejected":
    case "expired":
    case "withdrawn":
      return {
        backgroundColor: theme.colors.errorContainer,
        color: theme.colors.onErrorContainer,
      };
    case "completed":
      return {
        backgroundColor: theme.colors.primaryContainer,
        color: theme.colors.onPrimaryContainer,
      };
    case "invited":
      return {
        backgroundColor: theme.colors.secondaryContainer,
        color: theme.colors.onSecondaryContainer,
      };
    case "registered":
    default:
      return {
        backgroundColor: theme.colors.surfaceVariant,
        color: theme.colors.onSurfaceVariant,
      };
  }
};
