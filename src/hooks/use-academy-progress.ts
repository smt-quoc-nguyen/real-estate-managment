import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "propertyos-academy-progress-v1";

interface StoredProgress {
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  checkpointIdsByWeek: Record<string, string[]>;
}

const EMPTY_PROGRESS: StoredProgress = {
  completedLessonIds: [],
  bookmarkedLessonIds: [],
  checkpointIdsByWeek: {},
};

function readProgress(): StoredProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds.filter((id): id is string => typeof id === "string")
        : [],
      bookmarkedLessonIds: Array.isArray(parsed.bookmarkedLessonIds)
        ? parsed.bookmarkedLessonIds.filter((id): id is string => typeof id === "string")
        : [],
      checkpointIdsByWeek:
        parsed.checkpointIdsByWeek && typeof parsed.checkpointIdsByWeek === "object"
          ? Object.fromEntries(
              Object.entries(parsed.checkpointIdsByWeek).map(([weekId, ids]) => [
                weekId,
                Array.isArray(ids)
                  ? ids.filter((id): id is string => typeof id === "string")
                  : [],
              ]),
            )
          : {},
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function useAcademyProgress(allLessonIds: string[]) {
  const [progress, setProgress] = useState<StoredProgress>(readProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // The course remains usable when storage is unavailable (private mode/quota).
    }
  }, [progress]);

  const markComplete = useCallback((lessonId: string) => {
    setProgress((current) =>
      current.completedLessonIds.includes(lessonId)
        ? current
        : {
            ...current,
            completedLessonIds: [...current.completedLessonIds, lessonId],
          },
    );
  }, []);

  const markIncomplete = useCallback((lessonId: string) => {
    setProgress((current) => ({
      ...current,
      completedLessonIds: current.completedLessonIds.filter((id) => id !== lessonId),
    }));
  }, []);

  const toggleBookmark = useCallback((lessonId: string) => {
    setProgress((current) => ({
      ...current,
      bookmarkedLessonIds: current.bookmarkedLessonIds.includes(lessonId)
        ? current.bookmarkedLessonIds.filter((id) => id !== lessonId)
        : [...current.bookmarkedLessonIds, lessonId],
    }));
  }, []);

  const setWeekCheckpoints = useCallback((weekId: string, checkpointIds: string[]) => {
    setProgress((current) => ({
      ...current,
      checkpointIdsByWeek: {
        ...current.checkpointIdsByWeek,
        [weekId]: checkpointIds,
      },
    }));
  }, []);

  const resetProgress = useCallback(() => setProgress(EMPTY_PROGRESS), []);

  const completedCount = useMemo(
    () =>
      allLessonIds.reduce(
        (count, lessonId) => count + Number(progress.completedLessonIds.includes(lessonId)),
        0,
      ),
    [allLessonIds, progress.completedLessonIds],
  );

  return {
    completedLessonIds: progress.completedLessonIds,
    bookmarkedLessonIds: progress.bookmarkedLessonIds,
    checkpointIdsByWeek: progress.checkpointIdsByWeek,
    completedCount,
    progressPercent: allLessonIds.length
      ? Math.round((completedCount / allLessonIds.length) * 100)
      : 0,
    isComplete: (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    isBookmarked: (lessonId: string) => progress.bookmarkedLessonIds.includes(lessonId),
    markComplete,
    markIncomplete,
    toggleBookmark,
    getWeekCheckpointIds: (weekId: string) => progress.checkpointIdsByWeek[weekId] ?? [],
    setWeekCheckpoints,
    resetProgress,
  };
}
