import React from 'react';
import { View } from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';

function EmptyStateCard({
  title,
  icon,
  message,
  suggestion,
}: {
  title: string;
  icon: string;
  message: string;
  suggestion: string;
}) {
  const theme = useTheme();

  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 12,
          color: theme.colors.onBackground,
        }}
      >
        {title}
      </Text>

      <View
        style={{ alignItems: 'center', borderRadius: 12 }}
      >
        <Avatar.Icon
          icon={icon}
          size={56}
          style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: '500',
            color: theme.colors.onSurfaceVariant,
            marginBottom: 4,
          }}
        >
          {message}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.onSurfaceDisabled,
            textAlign: 'center',
          }}
        >
          {suggestion}
        </Text>
      </View>
    </View>
  );
}

export default EmptyStateCard;
