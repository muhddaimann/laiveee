import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth.token";
const EXP_KEY = "auth.exp";

async function secureAvailable() {
  try {
    if (Platform.OS === "web") return false;
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function storeToken(token: string, expUnix: number) {
  if (await secureAvailable()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(EXP_KEY, String(expUnix));
  } else {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXP_KEY, String(expUnix));
  }
}

export async function getToken(): Promise<string | null> {
  let token: string | null = null;
  let expStr: string | null = null;

  if (await secureAvailable()) {
    token = await SecureStore.getItemAsync(TOKEN_KEY);
    expStr = await SecureStore.getItemAsync(EXP_KEY);
  } else {
    token = localStorage.getItem(TOKEN_KEY);
    expStr = localStorage.getItem(EXP_KEY);
  }

  const exp = Number(expStr ?? 0);
  if (!token) return null;
  if (exp && Date.now() / 1000 > exp) {
    await removeToken();
    return null;
  }
  return token;
}

export async function removeToken() {
  if (await secureAvailable()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(EXP_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXP_KEY);
  }
}
