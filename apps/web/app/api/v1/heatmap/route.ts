import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stateHeatmap = [
      { state: 'Delhi (NCR)', code: 'DEL', indexValue: 106.4, status: 'HIGH', hub: 'Indira Gandhi Intl (DEL)' },
      { state: 'Maharashtra', code: 'MH', indexValue: 104.2, status: 'MODERATE', hub: 'Chhatrapati Shivaji Intl (BOM)' },
      { state: 'Karnataka', code: 'KA', indexValue: 103.8, status: 'MODERATE', hub: 'Kempegowda Intl (BLR)' },
      { state: 'Tamil Nadu', code: 'TN', indexValue: 102.1, status: 'STABLE', hub: 'Chennai Intl (MAA)' },
      { state: 'West Bengal', code: 'WB', indexValue: 101.9, status: 'STABLE', hub: 'Netaji Subhash Chandra Bose (CCU)' },
      { state: 'Telangana', code: 'TG', indexValue: 103.1, status: 'MODERATE', hub: 'Rajiv Gandhi Intl (HYD)' },
      { state: 'Gujarat', code: 'GJ', indexValue: 102.5, status: 'STABLE', hub: 'Sardar Vallabhbhai Patel (AMD)' },
      { state: 'Kerala', code: 'KL', indexValue: 105.0, status: 'HIGH', hub: 'Cochin Intl (COK)' }
    ];

    return NextResponse.json({
      data: stateHeatmap,
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/heatmap ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch heatmap data' } },
      { status: 500 }
    );
  }
}
