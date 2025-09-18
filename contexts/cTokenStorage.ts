const TOKEN_KEY = 'auth_token';
const EXP_KEY = 'auth_token_exp';

export async function storeToken(token: string, exp: number): Promise<void> {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXP_KEY, exp.toString());
}

export async function getToken(): Promise<string | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  const expStr = localStorage.getItem(EXP_KEY);

  if (!token || !expStr) {
    return null;
  }

  const exp = parseInt(expStr, 10);
  if (Date.now() / 1000 > exp) {
    await removeToken();
    return null;
  }

  return token;
}

export async function removeToken(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
}

export async function getExpiration(): Promise<number | null> {
  const expStr = localStorage.getItem(EXP_KEY);
  if (!expStr) {
    return null;
  }
  return parseInt(expStr, 10);
}