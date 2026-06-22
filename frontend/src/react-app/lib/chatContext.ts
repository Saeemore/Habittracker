import { apiFetch } from "./api";
import {
  getDisplayUsername,
  getOnboardingData,
  loadStoredHabits,
  type StoredHabit,
} from "./storage";

export type ChatHabit = {
  id?: string;
  name: string;
  category: string;
  streak: number;
  completed: boolean;
  targetTime: string;
  endGoal: string;
  why?: string;
  longestStreak?: number;
};

export type OnboardingProfile = {
  sleepType?: string;
  goal?: string;
  consistency?: string;
  blockers?: string[];
  reminderTime?: string;
  duration?: string;
  lifestyleRating?: number;
  focusNote?: string;
};

export type ChatUserContext = {
  username: string;
  habits: ChatHabit[];
  profile: OnboardingProfile | null;
  todayProgress: {
    completed: number;
    total: number;
    completionRate: number;
  };
  localTime: string;
  dayOfWeek: string;
  habitsSource: "local" | "database" | "merged";
};

type ApiHabit = {
  _id: string;
  name: string;
  category?: string;
  targetTime?: string;
  endGoal?: string;
  why?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastCheckinDate?: string;
};

function mapLocalHabit(habit: StoredHabit): ChatHabit {
  return {
    id: habit.id,
    name: habit.name,
    category: habit.category,
    streak: habit.streak,
    completed: habit.completed,
    targetTime: habit.targetTime || "Any time",
    endGoal: habit.endGoal || "Daily goal",
  };
}

function findLocalMatch(localHabits: StoredHabit[], remote: ApiHabit) {
  return localHabits.find(
    (local) =>
      local.id === remote._id || local.name.trim().toLowerCase() === remote.name.trim().toLowerCase()
  );
}

function mergeHabitsFromApi(localHabits: StoredHabit[], remoteHabits: ApiHabit[]): ChatHabit[] {
  const today = new Date().toISOString().slice(0, 10);
  const merged: ChatHabit[] = remoteHabits.map((remote) => {
    const local = findLocalMatch(localHabits, remote);
    return {
      id: remote._id,
      name: remote.name,
      category: remote.category || local?.category || "General",
      streak: remote.currentStreak ?? local?.streak ?? 0,
      completed: local?.completed ?? remote.lastCheckinDate === today,
      targetTime: remote.targetTime || local?.targetTime || "Any time",
      endGoal: remote.endGoal || local?.endGoal || "Daily goal",
      why: remote.why || "",
      longestStreak: remote.longestStreak ?? 0,
    };
  });

  for (const local of localHabits) {
    const alreadyIncluded = merged.some(
      (habit) =>
        habit.id === local.id ||
        habit.name.trim().toLowerCase() === local.name.trim().toLowerCase()
    );
    if (!alreadyIncluded) merged.push(mapLocalHabit(local));
  }

  return merged.slice(0, 20);
}

function buildProgress(habits: ChatHabit[]) {
  const completed = habits.filter((habit) => habit.completed).length;
  const total = habits.length;
  return {
    completed,
    total,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
  };
}

export function buildChatUserContext(): ChatUserContext {
  const localHabits = loadStoredHabits();
  const habits = localHabits.map(mapLocalHabit);
  const now = new Date();

  return {
    username: getDisplayUsername(),
    habits,
    profile: getOnboardingData<OnboardingProfile>(),
    todayProgress: buildProgress(habits),
    localTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dayOfWeek: now.toLocaleDateString([], { weekday: "long" }),
    habitsSource: "local",
  };
}

export async function fetchChatUserContext(): Promise<ChatUserContext> {
  const localHabits = loadStoredHabits();
  const now = new Date();
  const base = {
    username: getDisplayUsername(),
    profile: getOnboardingData<OnboardingProfile>(),
    localTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dayOfWeek: now.toLocaleDateString([], { weekday: "long" }),
  };

  try {
    const { habits: remoteHabits } = await apiFetch<{ habits: ApiHabit[] }>("/habits");
    if (Array.isArray(remoteHabits) && remoteHabits.length > 0) {
      const habits = mergeHabitsFromApi(localHabits, remoteHabits);
      const habitsSource = localHabits.length ? "merged" : "database";
      return {
        ...base,
        habits,
        todayProgress: buildProgress(habits),
        habitsSource,
      };
    }
  } catch {
    // Fall back to local habits when offline or unauthenticated.
  }

  const habits = localHabits.map(mapLocalHabit);
  return {
    ...base,
    habits,
    todayProgress: buildProgress(habits),
    habitsSource: "local",
  };
}
