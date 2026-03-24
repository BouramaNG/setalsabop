// Rate limiter simple en mémoire — suffisant pour un petit trafic
// Pour production à grande échelle, utiliser Redis

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * @param key      identifiant unique (ex: IP ou userId)
 * @param max      nombre max de requêtes dans la fenêtre
 * @param windowMs fenêtre de temps en ms (défaut: 60s)
 * @returns true si la requête est autorisée, false si bloquée
 */
export function rateLimit(key: string, max: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
