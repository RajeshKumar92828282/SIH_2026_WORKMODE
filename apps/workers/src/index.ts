import { executeSingleTick } from './tick';

const TICK_INTERVAL_MS = 60000; // 1 minute

console.log('[WORKER DAEMON] Starting APIx Background Workers Engine Daemon...');
console.log(`[WORKER DAEMON] Scheduled tick interval: ${TICK_INTERVAL_MS / 1000}s`);

// Initial immediate tick run
executeSingleTick();

// Periodic tick loop
setInterval(() => {
  executeSingleTick();
}, TICK_INTERVAL_MS);
