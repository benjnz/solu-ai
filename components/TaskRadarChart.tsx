import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AutomatedTask } from '../types';

interface TaskRadarChartProps {
  tasks: AutomatedTask[];
}

const TaskRadarChart: React.FC<TaskRadarChartProps> = ({ tasks }) => {
  const data = tasks.map(task => ({
    subject: task.taskName.length > 25 ? task.taskName.substring(0, 22) + "..." : task.taskName,
    score: task.automationScore,
    fullMark: 100
  }));

  return (
    <div className="w-full h-[400px] bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden group print:bg-white print:border-[1px] print:border-slate-200 print:shadow-none print:break-inside-avoid">
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-colors duration-700 print:hidden"></div>
      
      <div className="mb-4">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full print:bg-indigo-500"></span>
          Automation Heatmap
        </h3>
        <p className="text-sm font-medium text-slate-500 print:text-slate-600">Visual distribution of AI impact potential across core responsibilities.</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} 
              itemStyle={{ color: '#6366f1', fontWeight: 700 }}
            />
            <Radar 
              name="AI Suitability %" 
              dataKey="score" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fill="#6366f1" 
              fillOpacity={0.3} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskRadarChart;
