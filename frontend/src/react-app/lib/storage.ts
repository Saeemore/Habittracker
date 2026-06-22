export type SessionUser = {
  id: string;
  email?: string;
  username: string;
};

export type StoredHabit = {
  id: string;
  name: string;
  endGoal: string;
  targetTime: string;
  completed: boolean;
  category: string;
  streak: number;
};

const SESSION_USER_KEY = "trackify:session-user";
const LEGACY_USERNAME_KEY = "username";
const LOGIN_FLAG_KEY = "isLoggedIn";
const LEGACY_HABITS_KEY = "trackify:habits";
const LEGACY_ONBOARDING_COMPLETE_KEY = "onboardingComplete";
const LEGACY_ONBOARDING_DATA_KEY = "onboardingData";

function createScopedKey(scope: string, user: SessionUser | null = getSessionUser()) {
  const userScope = user?.id || user?.username?.trim().toLowerCase();
  return userScope ? `trackify:user:${userScope}:${scope}` : `trackify:guest:${scope}`;
}

function normalizeHabit(habit: Record<string, unknown>): StoredHabit {
  return {
    id: String(habit.id ?? Date.now().toString()),
    name: String(habit.name ?? "Untitled Habit"),
    endGoal: String(habit.endGoal ?? habit.target ?? "Daily goal"),
    targetTime: String(habit.targetTime ?? habit.time ?? "Any time"),
    completed: Boolean(habit.completed),
    category: String(habit.category ?? "Other"),
    streak: Number(habit.streak ?? 0),
  };
}

export function getSessionUser(): SessionUser | null {
  const stored = localStorage.getItem(SESSION_USER_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<SessionUser>;
    if (!parsed.id || !parsed.username) return null;
    return {
      id: String(parsed.id),
      email: parsed.email ? String(parsed.email) : undefined,
      username: String(parsed.username),
    };
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(LEGACY_USERNAME_KEY);
    return;
  }

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  localStorage.setItem(LEGACY_USERNAME_KEY, user.username);
}

export function setSessionLoggedIn(isLoggedIn: boolean) {
  if (isLoggedIn) localStorage.setItem(LOGIN_FLAG_KEY, "true");
  else localStorage.removeItem(LOGIN_FLAG_KEY);
}

export function isSessionLoggedIn() {
  return localStorage.getItem(LOGIN_FLAG_KEY) === "true";
}

export function clearSession() {
  setSessionUser(null);
  setSessionLoggedIn(false);
}

export function getDisplayUsername() {
  return getSessionUser()?.username || localStorage.getItem(LEGACY_USERNAME_KEY) || "User";
}

export function getHabitsStorageKey(user: SessionUser | null = getSessionUser()) {
  return createScopedKey("habits", user);
}

export function loadStoredHabits(user: SessionUser | null = getSessionUser()): StoredHabit[] {
  try {
    const storedHabits = localStorage.getItem(getHabitsStorageKey(user));
    if (!storedHabits) return [];

    const parsed = JSON.parse(storedHabits);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((habit) => normalizeHabit(habit as Record<string, unknown>));
  } catch {
    return [];
  }
}

export function saveStoredHabits(habits: StoredHabit[], user: SessionUser | null = getSessionUser()) {
  localStorage.setItem(getHabitsStorageKey(user), JSON.stringify(habits));
}

export function getOnboardingComplete(user: SessionUser | null = getSessionUser()) {
  return localStorage.getItem(createScopedKey("onboardingComplete", user)) === "true";
}

export function setOnboardingComplete(value: boolean, user: SessionUser | null = getSessionUser()) {
  const key = createScopedKey("onboardingComplete", user);
  if (value) localStorage.setItem(key, "true");
  else localStorage.removeItem(key);
}

export function getOnboardingData<T>(user: SessionUser | null = getSessionUser()): T | null {
  const stored = localStorage.getItem(createScopedKey("onboardingData", user));
  if (!stored) return null;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setOnboardingData(data: unknown, user: SessionUser | null = getSessionUser()) {
  localStorage.setItem(createScopedKey("onboardingData", user), JSON.stringify(data));
}

export function migrateLegacyLocalDataForUser(
  user: SessionUser,
  previousUsername: string | null = localStorage.getItem(LEGACY_USERNAME_KEY)
) {
  const sameUser =
    previousUsername?.trim().toLowerCase() === user.username.trim().toLowerCase();

  if (sameUser) {
    const legacyHabits = localStorage.getItem(LEGACY_HABITS_KEY);
    if (legacyHabits && !localStorage.getItem(getHabitsStorageKey(user))) {
      localStorage.setItem(getHabitsStorageKey(user), legacyHabits);
    }

    const legacyOnboardingComplete = localStorage.getItem(LEGACY_ONBOARDING_COMPLETE_KEY);
    if (legacyOnboardingComplete && !getOnboardingComplete(user)) {
      setOnboardingComplete(legacyOnboardingComplete === "true", user);
    }

    const legacyOnboardingData = localStorage.getItem(LEGACY_ONBOARDING_DATA_KEY);
    if (
      legacyOnboardingData &&
      !localStorage.getItem(createScopedKey("onboardingData", user))
    ) {
      localStorage.setItem(createScopedKey("onboardingData", user), legacyOnboardingData);
    }
  }

  localStorage.removeItem(LEGACY_HABITS_KEY);
  localStorage.removeItem(LEGACY_ONBOARDING_COMPLETE_KEY);
  localStorage.removeItem(LEGACY_ONBOARDING_DATA_KEY);
}
