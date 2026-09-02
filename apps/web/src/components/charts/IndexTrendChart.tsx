'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AirplaneActiveDot } from './AirplaneChartElements';

interface HistoryPoint {
  timestamp: string;
  indexValue: number;
  delBomContribution?: number;
  delBlrContribution?: number;
  bomBlrContribution?: number;
}

interface IndexTrendChartProps {
  data: HistoryPoint[];
}

export function IndexTrendChart({ data }: IndexTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: new Date(d.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  return (
    <div className="w-full h-80 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.6} />
          <XAxis dataKey="timeLabel" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#374151',
              borderRadius: '0.75rem',
              color: '#f3f4f6',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="indexValue"
            name="Overall APIx Index"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 3, fill: '#10b981' }}
            activeDot={<AirplaneActiveDot stroke="#10b981" />}
          />
          <Line
            type="monotone"
            dataKey="delBomContribution"
            name="DEL-BOM (45%)"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="delBlrContribution"
            name="DEL-BLR (35%)"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="bomBlrContribution"
            name="BOM-BLR (20%)"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
