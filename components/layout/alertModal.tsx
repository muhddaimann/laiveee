
import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
};

export default function AlertModal({ visible, title, message, buttons, onClose }: AlertModalProps) {
  const theme = useTheme();

  const getButtonColor = (style: AlertButton['style']) => {
    switch (style) {
      case 'destructive':
        return theme.colors.error;
      case 'cancel':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  onClose();
                }}
                style={styles.button}
              >
                <Text style={[styles.buttonText, { color: getButtonColor(button.style) }]}>
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 15,
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
