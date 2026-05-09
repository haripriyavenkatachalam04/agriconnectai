import { useCallback, useEffect, useState } from "react";

type Perm = "default" | "granted" | "denied" | "unsupported";

export function useNotifications() {
  const [permission, setPermission] = useState<Perm>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Perm);
  }, []);

  const request = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const p = await Notification.requestPermission();
    setPermission(p as Perm);
    return p;
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!("Notification" in window) || Notification.permission !== "granted") return null;
      try {
        return new Notification(title, {
          icon: "/agriconnectai/icon-192.png",
          badge: "/agriconnectai/icon-192.png",
          ...options,
        });
      } catch {
        return null;
      }
    },
    [],
  );

  /** Schedule a notification to fire at a future Date (best-effort, in-tab setTimeout). */
  const schedule = useCallback(
    (when: Date, title: string, options?: NotificationOptions) => {
      const delay = when.getTime() - Date.now();
      if (delay <= 0) {
        notify(title, options);
        return () => {};
      }
      // Cap at ~24 days (setTimeout int32 limit). Beyond that, persist in localStorage.
      const MAX = 2_000_000_000;
      if (delay > MAX) {
        const queue = JSON.parse(localStorage.getItem("agriconnect-reminders") || "[]");
        queue.push({ when: when.toISOString(), title, options });
        localStorage.setItem("agriconnect-reminders", JSON.stringify(queue));
        return () => {};
      }
      const id = window.setTimeout(() => notify(title, options), delay);
      return () => clearTimeout(id);
    },
    [notify],
  );

  return { permission, request, notify, schedule };
}

/** Replay any reminders whose scheduled time has now passed. Call once on app load. */
export function flushPendingReminders() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const raw = localStorage.getItem("agriconnect-reminders");
  if (!raw) return;
  try {
    const queue: { when: string; title: string; options?: NotificationOptions }[] = JSON.parse(raw);
    const now = Date.now();
    const remaining = queue.filter((r) => {
      if (new Date(r.when).getTime() <= now) {
        new Notification(r.title, { icon: "/agriconnectai/icon-192.png", ...r.options });
        return false;
      }
      return true;
    });
    localStorage.setItem("agriconnect-reminders", JSON.stringify(remaining));
  } catch {
    /* ignore */
  }
}
