export interface RouteDTO {
  id: string;
  origin: string;
  destination: string;
  weight: number;
}

export interface CarrierDTO {
  id: string;
  name: string;
  code: string;
}

export interface FareRecord {
  routeId: string;
  carrierId: string;
  leadTimeWindow: 'T+1' | 'T+15';
  baseFare: number;
  taxes: number;
  fees: number;
  totalFare: number;
}

export interface IndexSummaryDTO {
  currentIndex: number;
  prevIndex: number;
  pctChange24h: number;
  intradayMin: number;
  intradayMax: number;
  lastUpdated: string;
  sampleCount: number;
  status: 'STABLE' | 'VOLATILE' | 'HIGH_SPIKE';
}

export interface IndexHistoryPointDTO {
  timestamp: string;
  indexValue: number;
  delBomContribution: number;
  delBlrContribution: number;
  bomBlrContribution: number;
}

export interface ObservationDTO {
  id: number;
  computedAt: string;
  routeId: string;
  carrierId: string;
  leadTimeWindow: string;
  staticTotalFare: number;
  liveTotalFare: number;
  fareDiff: number;
  pctChange: number;
  relativePrice: number;
  routeWeight: number;
  indexContribution: number;
}

export interface AlertDTO {
  id: number;
  type: 'FARE_SPIKE' | 'DATA_QUALITY';
  routeId?: string;
  message: string;
  createdAt: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: {
    generated_at: string;
    page?: number;
    total?: number;
    limit?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
