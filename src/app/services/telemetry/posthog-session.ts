// PostHog's current session id, for the backend logs. The HTTP interceptor sends it as X-Correlation-ID so a
// PostHog recording and the Seq logs of the same visit can be found from each other.
let sessionIdSource: (() => string | undefined) | undefined;

export function setPostHogSessionSource(source: () => string | undefined): void {
  sessionIdSource = source;
}

export function currentPostHogSessionId(): string | undefined {
  try {
    return sessionIdSource?.() || undefined;
  } catch {
    return undefined;
  }
}
