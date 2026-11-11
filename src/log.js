export function createLogger({ instanceId, mode }) {
  return message => console.log(`[inst=${instanceId} mode=${mode}] ${message}`);
}
