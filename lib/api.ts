import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

/**
 * Host of the Mac running Metro. `hostUri` is usually available in the dev
 * client; `SourceCode.scriptURL` is the fallback when it is not.
 */
function devServerHost() {
  const fromConstants = Constants.expoConfig?.hostUri?.split(':')[0]?.trim();
  if (fromConstants) return fromConstants;

  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  return scriptURL?.match(/^https?:\/\/([^/:]+)/)?.[1];
}

/**
 * On the simulator `localhost` works, but on a physical iPhone it points to
 * the phone itself. Expo knows the Mac's IP, so in development we reuse that
 * host to reach the local API.
 */
function resolveApiUrl() {
  const configured =
    process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl || 'http://localhost:3000';

  if (!__DEV__ || Platform.OS === 'web') {
    return configured;
  }

  const localUrl = /^http:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/;
  if (!localUrl.test(configured)) {
    return configured;
  }

  const devHost = devServerHost();
  if (!devHost || devHost === 'localhost' || devHost === '127.0.0.1') {
    return configured;
  }

  // Only switch to local network IPs. With `--tunnel` the host is an
  // exp.direct domain that does not expose port 3000: in that case define
  // EXPO_PUBLIC_API_URL with a public URL.
  const isLanHost =
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(devHost) ||
    devHost.endsWith('.local');
  if (!isLanHost) {
    return configured;
  }

  return configured.replace(localUrl, `http://${devHost}`);
}

export const API_URL = resolveApiUrl();

const ACCESS_KEY = 'cellar.accessToken';
const REFRESH_KEY = 'cellar.refreshToken';
const USER_KEY = 'cellar.user';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type Cellar = {
  id: string;
  name: string;
  kind: 'default' | 'favorites' | 'custom' | string;
};

export type Wine = {
  id: string;
  name: string;
  winery: string;
  country: string;
  year: number;
  grape: string;
  rating: number;
  notes: string;
  vintage: string;
};

/** Data sent by the client when creating a wine. `vintage` is optional. */
export type WineInput = Omit<Wine, 'id' | 'vintage'> & { vintage?: string };

export type GoogleSignInInput = {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientId: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function storage(): Storage {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key) => {
        window.localStorage.removeItem(key);
      },
    };
  }
  return AsyncStorage;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
/** Deduplicates concurrent refreshes: several requests share the same promise. */
let refreshing: Promise<boolean> | null = null;

async function saveSession(session: AuthResponse) {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken;
  const store = storage();
  await store.setItem(ACCESS_KEY, session.accessToken);
  await store.setItem(REFRESH_KEY, session.refreshToken);
  await store.setItem(USER_KEY, JSON.stringify(session.user));
}

export async function clearSession() {
  accessToken = null;
  refreshToken = null;
  const store = storage();
  await store.removeItem(ACCESS_KEY);
  await store.removeItem(REFRESH_KEY);
  await store.removeItem(USER_KEY);
}

export async function loadStoredUser(): Promise<AuthUser | null> {
  const store = storage();
  accessToken = await store.getItem(ACCESS_KEY);
  refreshToken = await store.getItem(REFRESH_KEY);
  const raw = await store.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function refreshAccess() {
  if (!refreshToken) return false;
  if (!refreshing) {
    const current = refreshToken;
    refreshing = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current }),
      });
      if (!response.ok) {
        await clearSession();
        return false;
      }
      const data = (await response.json()) as AuthResponse;
      await saveSession(data);
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function request<T>(path: string, options: RequestInit = {}, allowRefresh = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  // A 401 may mean the access token expired: refresh once and retry the
  // request. Auth routes are never retried.
  if (response.status === 401 && allowRefresh && refreshToken && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccess();
    if (refreshed) {
      return request<T>(path, options, false);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Error de la API');
  }
  return data as T;
}

export async function loginWithGoogle(input: GoogleSignInInput) {
  const session = await request<AuthResponse>(
    '/auth/google',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
  await saveSession(session);
  return session.user;
}

export async function logout() {
  const current = refreshToken;
  try {
    if (current) {
      await request<void>(
        '/auth/logout',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: current }),
        },
        false,
      );
    }
  } finally {
    await clearSession();
  }
}

export function getMe() {
  return request<AuthUser>('/me');
}

export function listCellars() {
  return request<Cellar[]>('/cellars');
}

export function listWines(cellarId: string) {
  return request<Wine[]>(`/cellars/${cellarId}/wines`);
}

export function createWine(cellarId: string, wine: WineInput) {
  return request<Wine>(`/cellars/${cellarId}/wines`, {
    method: 'POST',
    body: JSON.stringify(wine),
  });
}
