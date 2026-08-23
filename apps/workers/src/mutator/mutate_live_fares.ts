import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function mutateLiveFares(currentTick: number) {
  console.log(`[MUTATOR] Executing tick #${currentTick} mutation on live_fares (DB2)...`);

  const staticFares = await prisma.staticFare.findMany();

  for (const sf of staticFares) {
    // Lead time T+1 experiences higher volatility than T+15
    const volatilityFactor = sf.leadTimeWindow === 'T+1' ? 0.12 : 0.05;

    // Introduce Gaussian-like variation centered around small upward drift (+1% to +3%)
    const randomVariation = (Math.random() * 2 - 0.8) * volatilityFactor;
    const factor = 1 + randomVariation;

    const newBase = Math.round(Number(sf.baseFare) * factor * 100) / 100;
    const newTaxes = Math.round(Number(sf.taxes) * factor * 100) / 100;
    const newFees = Number(sf.fees); // Fees stay constant
    const newTotal = Math.round((newBase + newTaxes + newFees) * 100) / 100;

    await prisma.liveFare.upsert({
      where: {
        routeId_carrierId_leadTimeWindow: {
          routeId: sf.routeId,
          carrierId: sf.carrierId,
          leadTimeWindow: sf.leadTimeWindow
        }
      },
      update: {
        baseFare: newBase,
        taxes: newTaxes,
        fees: newFees,
        totalFare: newTotal,
        tick: currentTick
      },
      create: {
        routeId: sf.routeId,
        carrierId: sf.carrierId,
        leadTimeWindow: sf.leadTimeWindow,
        baseFare: newBase,
        taxes: newTaxes,
        fees: newFees,
        totalFare: newTotal,
        tick: currentTick
      }
    });
  }

  console.log(`[MUTATOR] Tick #${currentTick} complete. Mutated ${staticFares.length} live fare rows.`);
}
