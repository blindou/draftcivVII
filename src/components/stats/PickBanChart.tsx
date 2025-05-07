import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';

interface PickBanChartProps {
  data: {
    name: string;
    picks: number;
    bans: number;
  }[];
  title: string;
}

const PickBanChart: React.FC<PickBanChartProps> = ({ data, title }) => {
  return (
    <Card>
      <Card.Header>
        <h3 className="text-xl font-semibold">{title}</h3>
      </Card.Header>
      <Card.Content>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar dataKey="picks" fill="#f59e0b" name="Picks" />
              <Bar dataKey="bans" fill="#ef4444" name="Bans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
};

export default PickBanChart;