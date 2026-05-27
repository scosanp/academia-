import type { ProgressState } from "../types/course";
import { createEmptyProgress, normalizeProgress } from "./progress";

export const PROGRESS_STORAGE_KEY = "ai-start-progress-v1";

let memoryProgress: ProgressState = createEmptyProgress();

const canUseStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const key = "ai-start-storage-test";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export function loadProgressFromStorage(): { progress: ProgressState; persistent: boolean } {
  if (!canUseStorage()) {
    return { progress: memoryProgress, persistent: false };
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    const progress = raw ? normalizeProgress(JSON.parse(raw)) : createEmptyProgress();
    memoryProgress = progress;
    return { progress, persistent: true };
  } catch {
    return { progress: memoryProgress, persistent: false };
  }
}

export function saveProgressToStorage(progress: ProgressState) {
  memoryProgress = progress;

  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgressStorage() {
  memoryProgress = createEmptyProgress();

  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
