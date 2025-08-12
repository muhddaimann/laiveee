import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import AlertModal, { AlertButton } from "../components/layout/alertModal";
import Toast, { ToastType } from "../components/layout/toast";
import PasswordPromptModal from "../components/layout/passwordModal";

type AlertOptions = { title: string; message: string; buttons?: AlertButton[] };
type PasswordPromptOptions = {
  title: string;
  message: string;
  onSubmit: (password: string) => void;
};
type ToastOptions = { type?: ToastType; duration?: number };
type ToastState = {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
};

type NotificationContextType = {
  showAlert: (options: AlertOptions) => void;
  showToast: (message: string, options?: ToastOptions) => void;
  showPasswordPrompt: (options: PasswordPromptOptions) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<
    (AlertOptions & { visible: boolean }) | null
  >(null);
  const [passwordPromptConfig, setPasswordPromptConfig] = useState<
    (PasswordPromptOptions & { visible: boolean }) | null
  >(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showAlert = ({ title, message, buttons }: AlertOptions) => {
    setAlertConfig({
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
      visible: true,
    });
  };

  const showPasswordPrompt = ({
    title,
    message,
    onSubmit,
  }: PasswordPromptOptions) => {
    setPasswordPromptConfig({ title, message, onSubmit, visible: true });
  };

  const showToast = (message: string, options: ToastOptions = {}) => {
    const id = Date.now();
    const newToast: ToastState = {
      id,
      message,
      type: options.type || "info",
      duration: options.duration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const hideAlert = () =>
    alertConfig && setAlertConfig({ ...alertConfig, visible: false });
  const hidePasswordPrompt = () =>
    passwordPromptConfig &&
    setPasswordPromptConfig({ ...passwordPromptConfig, visible: false });
  const hideToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <NotificationContext.Provider
      value={{ showAlert, showToast, showPasswordPrompt }}
    >
      {children}

      {alertConfig?.visible && (
        <AlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons || []}
          onClose={hideAlert}
        />
      )}

      {passwordPromptConfig?.visible && (
        <PasswordPromptModal
          visible={passwordPromptConfig.visible}
          title={passwordPromptConfig.title}
          message={passwordPromptConfig.message}
          onSubmit={passwordPromptConfig.onSubmit}
          onClose={hidePasswordPrompt}
        />
      )}

      <View pointerEvents="box-none" style={styles.toastHost}>
        <View style={styles.toastStack}>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              duration={t.duration}
              onHide={() => hideToast(t.id)}
            />
          ))}
        </View>
      </View>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  return ctx;
}

const styles = StyleSheet.create({
  toastHost: {
    position: "absolute",
    right: 24,
    bottom: 24,
    left: undefined,
  },
  toastStack: {
    alignItems: "flex-end",
    flexDirection: "column-reverse",
  },
});
