import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { FinancialParams } from '../types';

interface BlueprintChartProps {
  financials: FinancialParams;
}

const BlueprintChart: React.FC<BlueprintChartProps> = ({ financials }) => {
  const data = useMemo(() => {
    const result = [];
    const { employeeSalary, implementationCost, monthlyMaintenance, timeHorizonMonths } = financials;
    const monthlySalary = employeeSalary / 12;

    let cumulativeManual = 0;
    let cumulativeAuto = implementationCost;

    for (let month = 0; month <= timeHorizonMonths; month++) {
      if (month > 0) {
        cumulativeManual += monthlySalary;
        cumulativeAuto += monthlyMaintenance;
      }
      
      result.push({
        month,
        "Human Cost": Math.round(cumulativeManual),
        "Automation Cost": Math.round(cumulativeAuto),
      });
    }
    return result;
  }, [financials]);

  // Find break even point (intersection) roughly
  const breakEvenPoint = useMemo(() => {
      const match = data.find(d => d["Automation Cost"] <= d["Human Cost"] && d.month > 0);
      return match ? match : null;
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Projected ROI & Break-Even Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            label={{ value: 'Months', position: 'insideBottomRight', offset: -10 }} 
            stroke="#64748b"
          />
          <YAxis 
            tickFormatter={(value) => `$${value / 1000}k`} 
            stroke="#64748b"
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Human Cost" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Automation Cost" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            activeDot={{ r: 8 }} 
          />
          {breakEvenPoint && (
             <ReferenceDot 
                x={breakEvenPoint.month} 
                y={breakEvenPoint["Automation Cost"]} 
                r={6} 
                fill="#f59e0b" 
                stroke="#fff"
             />
          )}
        </LineChart>
      </ResponsiveContainer>
      {breakEvenPoint && (
          <div className="mt-2 text-center text-sm font-medium text-amber-600">
              Break-even projected at Month {breakEvenPoint.month}
          </div>
      )}
    </div>
  );
};

export default BlueprintChart;