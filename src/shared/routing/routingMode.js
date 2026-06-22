export const ROUTING_MODES = Object.freeze({
  BROWSER: 'browser',
  HASH: 'hash',
})

export function getRoutingMode() {
  return import.meta.env.VITE_ROUTING_MODE === ROUTING_MODES.HASH
    ? ROUTING_MODES.HASH
    : ROUTING_MODES.BROWSER
}

export function isHashRouting() {
  return getRoutingMode() === ROUTING_MODES.HASH
}
