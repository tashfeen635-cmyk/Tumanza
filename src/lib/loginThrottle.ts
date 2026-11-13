const MAX_ATTEMPTS = 3;
const LOCK_MS = 60 * 1000;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 5000;

interface AttemptRecord {
  failures: number;
  lastFailure: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptRecord>();

function pruneIfNeeded(now: number) {
  if (attempts.size < MAX_TRACKED_KEYS) return;
  for (const [key, record] of attempts) {
    const expired =
      record.lockedUntil > 0
        ? record.lockedUntil <= now
        : now - record.lastFailure > FAILURE_WINDOW_MS;
    if (expired) attempts.delete(key);
  }
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return 'unknown';
}

export function checkLoginLock(key: string): { locked: boolean; retryAfter: number } {
  const now = Date.now();
  pruneIfNeeded(now);

  const record = attempts.get(key);
  if (!record) return { locked: false, retryAfter: 0 };

  if (record.lockedUntil > now) {
    return { locked: true, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  if (record.lockedUntil > 0) {
    attempts.delete(key);
    return { locked: false, retryAfter: 0 };
  }
  if (now - record.lastFailure > FAILURE_WINDOW_MS) {
    attempts.delete(key);
  }
  return { locked: false, retryAfter: 0 };
}

export function registerLoginFailure(key: string): {
  locked: boolean;
  retryAfter: number;
  attemptsRemaining: number;
} {
  const now = Date.now();
  pruneIfNeeded(now);

  let record = attempts.get(key);
  if (!record || (record.lockedUntil === 0 && now - record.lastFailure > FAILURE_WINDOW_MS)) {
    record = { failures: 0, lastFailure: now, lockedUntil: 0 };
  }

  if (record.lockedUntil > now) {
    return {
      locked: true,
      retryAfter: Math.ceil((record.lockedUntil - now) / 1000),
      attemptsRemaining: 0,
    };
  }

  record.failures += 1;
  record.lastFailure = now;

  if (record.failures >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_MS;
    attempts.set(key, record);
    return { locked: true, retryAfter: Math.ceil(LOCK_MS / 1000), attemptsRemaining: 0 };
  }

  attempts.set(key, record);
  return {
    locked: false,
    retryAfter: 0,
    attemptsRemaining: MAX_ATTEMPTS - record.failures,
  };
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
