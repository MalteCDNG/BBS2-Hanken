import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCurrent,
  fetchFanStatus,
  fetchHistory,
  SensorReading,
  type FanStatus,
} from "../services/api";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";

type TimeUnit = "second" | "minute" | "hour" | "day" | "month";

export type HistoryRange =
  | "1m"
  | "1h"
  | "6h"
  | "24h"
  | "7d"
  | "30d"
  | "90d"
  | "1y";

export type HistoryRangeOption = {
  label: string;
  durationMs: number;
  timeUnit: TimeUnit;
};

const HISTORY_RANGE_ORDER: HistoryRange[] = [
  "1m",
  "1h",
  "6h",
  "24h",
  "7d",
  "30d",
  "90d",
  "1y",
];

export const HISTORY_RANGE_OPTIONS: Record<HistoryRange, HistoryRangeOption> = {
  "1m": { label: "1 Minute", durationMs: 60 * 1000, timeUnit: "second" },
  "1h": { label: "1 Stunde", durationMs: 60 * 60 * 1000, timeUnit: "minute" },
  "6h": {
    label: "6 Stunden",
    durationMs: 6 * 60 * 60 * 1000,
    timeUnit: "hour",
  },
  "24h": {
    label: "24 Stunden",
    durationMs: 24 * 60 * 60 * 1000,
    timeUnit: "hour",
  },
  "7d": {
    label: "7 Tage",
    durationMs: 7 * 24 * 60 * 60 * 1000,
    timeUnit: "day",
  },
  "30d": {
    label: "30 Tage",
    durationMs: 30 * 24 * 60 * 60 * 1000,
    timeUnit: "day",
  },
  "90d": {
    label: "90 Tage",
    durationMs: 90 * 24 * 60 * 60 * 1000,
    timeUnit: "day",
  },
  "1y": {
    label: "1 Jahr",
    durationMs: 365 * 24 * 60 * 60 * 1000,
    timeUnit: "month",
  },
};

const HISTORY_BUCKET_SIZES: Record<HistoryRange, number> = {
  "1m": 10 * 1000,
  "1h": 5 * 60 * 1000,
  "6h": 5 * 60 * 1000,
  "24h": 5 * 60 * 1000,
  "7d": 5 * 60 * 1000,
  "30d": 5 * 60 * 1000,
  "90d": 5 * 60 * 1000,
  "1y": 5 * 60 * 1000,
};

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function useHistoryData(refreshInterval: number) {
  const [current, setCurrent] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fanStatus, setFanStatus] = useState<FanStatus | null>(null);
  const [fanError, setFanError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("7d");
  const [now, setNow] = useState(Date.now());

  const historyRangeOptions = useMemo(
    () =>
      HISTORY_RANGE_ORDER.map((value) => ({
        value,
        label: HISTORY_RANGE_OPTIONS[value].label,
      })),
    []
  );

  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - HISTORY_RANGE_OPTIONS[historyRange].durationMs;
    return history.filter(
      (entry) => new Date(entry.timestamp).getTime() >= cutoff
    );
  }, [history, historyRange]);

  const chartHistory = useMemo(() => {
    const bucketSizeMs = HISTORY_BUCKET_SIZES[historyRange];
    const buckets = new Map<number, SensorReading>();

    filteredHistory.forEach((entry) => {
      const time = new Date(entry.timestamp).getTime();
      const bucketKey = Math.floor(time / bucketSizeMs) * bucketSizeMs;
      const existing = buckets.get(bucketKey);

      if (!existing || new Date(existing.timestamp).getTime() < time) {
        buckets.set(bucketKey, entry);
      }
    });

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);
  }, [filteredHistory, historyRange]);

  const smoothingLabel = useMemo(() => {
    const bucketMs = HISTORY_BUCKET_SIZES[historyRange];
    if (bucketMs < 60 * 1000) {
      return `${bucketMs / 1000} Sekunden`;
    }

    const minutes = bucketMs / (60 * 1000);
    return `${minutes} Minuten`;
  }, [historyRange]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [currentReading, historyReadings, currentFanStatus] =
        await Promise.all([fetchCurrent(), fetchHistory(), fetchFanStatus()]);
      setCurrent(currentReading);
      const mergedHistory = [...historyReadings];
      const hasCurrentReading = historyReadings.some(
        (entry) =>
          new Date(entry.timestamp).getTime() ===
          new Date(currentReading.timestamp).getTime()
      );

      if (!hasCurrentReading) {
        mergedHistory.push(currentReading);
      }

      mergedHistory.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setHistory(mergedHistory);
      setError(null);
      setFanStatus(currentFanStatus);
      setFanError(null);
    } catch (err) {
      console.error(err);
      setError("Konnte Sensordaten nicht laden. Läuft der Mock-Server?");
      setFanError("Konnte Lüfterstatus nicht laden.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshData, refreshInterval]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const lastUpdatedAbsolute = current
    ? formatTimestamp(current.timestamp)
    : "—";
  const lastUpdatedRelative = useMemo(
    () =>
      current
        ? formatDistance(new Date(current.timestamp), new Date(now), {
            addSuffix: true,
            locale: de,
            includeSeconds: false,
          })
        : "—",
    [current, now]
  );

  return {
    chartHistory,
    current,
    error,
    fanError,
    fanStatus,
    history,
    historyRange,
    historyRangeOptions,
    isRefreshing,
    lastUpdatedAbsolute,
    lastUpdatedRelative,
    loading,
    refreshData,
    setFanError,
    setFanStatus,
    setHistoryRange,
    smoothingLabel,
  };
}

export type UseHistoryDataResult = ReturnType<typeof useHistoryData>;
