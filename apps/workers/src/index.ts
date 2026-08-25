import { runSimulationCycle } from './engine';

console.log('[WORKERS DAEMON] Initializing APIx Background Worker Engine...');

let cycle = 1;

// Execute immediately on startup
runSimulationCycle(cycle++)
  .then(() => {
    console.log('[WORKERS DAEMON] Initial simulation cycle completed.');
  })
  .catch((err) => {
    console.warn('[WORKERS DAEMON] First cycle warning:', err.message);
  });

// Run every 60 seconds
setInterval(() => {
  runSimulationCycle(cycle++)
    .catch((err) => {
      console.error('[WORKERS DAEMON] Simulation loop error:', err.message);
    });
}, 60000);
