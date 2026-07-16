export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export function createSessionTimeoutHandler(onExpire: () => void) {
  let timeoutId: number | undefined;
  let active = true;

  const reset = () => {
    if (!active) return;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      active = false;
      onExpire();
    }, SESSION_TIMEOUT_MS);
  };

  const stop = () => {
    active = false;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };

  const events: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'click', 'scroll', 'pointermove'];

  const attach = () => {
    reset();
    events.forEach(eventName => {
      window.addEventListener(eventName, reset, { passive: true });
    });
  };

  const detach = () => {
    events.forEach(eventName => {
      window.removeEventListener(eventName, reset);
    });
    stop();
  };

  return { attach, detach, reset };
}
