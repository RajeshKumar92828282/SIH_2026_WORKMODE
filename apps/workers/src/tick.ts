import { PrismaClient } from '@prisma/client';
import { loadStaticCsv } from './loader/load_static_csv';
import { mutateLiveFares } from './mutator/mutate_live_fares';
import { runCompareEngine } from './index-engine/compare';

const prisma = new PrismaClient();

let tickCounter = 0;

export async function executeSingleTick() {
  tickCounter++;
  const computedAt = new Date();
  console.log(`\n==============================================`);
  console.log(`[TICK ENGINE] Starting Tick #${tickCounter} at ${computedAt.toISOString()}`);
  console.log(`==============================================`);

  try {
    // 1. Ensure DB baseline is initialized
    const staticCount = await prisma.staticFare.count();
    if (staticCount === 0) {
      console.log('[TICK ENGINE] Baseline static_fares empty. Running initial loader...');
      await loadStaticCsv();
    }

    // 2. Mutate live fares (DB2)
    await mutateLiveFares(tickCounter);

    // 3. Run compare & calculate index_results (DB3)
    await runCompareEngine(computedAt);

    console.log(`[TICK ENGINE] Tick #${tickCounter} successfully completed.`);
  } catch (error) {
    console.error(`[TICK ENGINE ERROR] Failed during tick #${tickCounter}:`, error);
  }
}

if (require.main === module) {
  executeSingleTick()
    .then(() => prisma.$disconnect())
    .catch(() => process.exit(1));
}
