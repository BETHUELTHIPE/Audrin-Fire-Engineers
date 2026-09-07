import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../../data/serviceDueData';

interface QuarterlyProgressItem {
  category: string;
  shortLabel: string;
  completed: number;
  pending: number;
  overdue: number;
  total: number;
  clause: string;
  percent: number;
}

export const QuarterlyInspectionProgressBar: React.FC = () => {
  const [activeIntervalFilter, setActiveIntervalFilter] = useState<'all' | 'quarterly' | 'biannual' | 'annual'>('all');

  // Calculate real metrics from site maintenance profiles
  const totalSites = CLIENT_SITE_MAINTENANCE_PROFILES.length;
  
  // Breakdown by SANS 10139 statutory inspection intervals
  let quarterlyCompleted = 0;
  let quarterlyPending = 0;
  let quarterlyOverdue = 0;

  let biannualCompleted = 0;
  let biannualPending = 0;
  let biannualOverdue = 0;

  let annualCompleted = 0;
  let annualPending = 0;
  let annualOverdue = 0;

  CLIENT_SITE_MAINTENANCE_PROFILES.forEach((site) => {
    // Quarterly
    if (site.intervals?.quarterly?.status === 'compliant') {
      quarterlyCompleted += 1;
    } else if (site.intervals?.quarterly?.status === 'overdue') {
      quarterlyOverdue += 1;
    } else {
      quarterlyPending += 1;
    }

    // Bi-annual
    if (site.intervals?.biannual?.status === 'compliant') {
      biannualCompleted += 1;
    } else if (site.intervals?.biannual?.status === 'overdue') {
      biannualOverdue += 1;
    } else {
      biannualPending += 1;
    }

    // Annual
    if (site.intervals?.annual?.status === 'compliant') {
      annualCompleted += 1;
    } else if (site.intervals?.annual?.status === 'overdue') {
      annualOverdue += 1;
    } else {
      annualPending += 1;
    }
  });

  const chartData: QuarterlyProgressItem[] = [
    {
      category: 'Quarterly Zone Rotation',
      shortLabel: 'Quarterly (Cl. 25.2)',
      completed: quarterlyCompleted,
      pending: quarterlyPending,
      overdue: quarterlyOverdue,
      total: totalSites,
      clause: 'SANS 10139 Clause 25.2',
      percent: Math.round((quarterlyCompleted / totalSites) * 100)
    },
    {
      category: 'Bi-Annual Loop & Battery',
      shortLabel: 'Bi-Annual (Cl. 25.3)',
      completed: biannualCompleted,
      pending: biannualPending,
      overdue: biannualOverdue,
      total: totalSites,
      clause: 'SANS 10139 Clause 25.3.2',
      percent: Math.round((biannualCompleted / totalSites) * 100)
    },
    {
      category: 'Annual 100% Device Audit',
      shortLabel: 'Annual (Cl. 25.3.3)',
      completed: annualCompleted,
      pending: annualPending,
      overdue: annualOverdue,
      total: totalSites,
      clause: 'SANS 10139 Clause 25.3.3',
      percent: Math.round((annualCompleted / totalSites) * 100)
    }
  ];

  // Overall Quarterly Aggregate (Focus on Current Quarter)
  const totalQuarterlyTests = quarterlyCompleted + quarterlyPending + quarterlyOverdue;
  const overallCompletedPercent = Math.round((quarterlyCompleted / totalQuarterlyTests) * 100);
  const overallPendingPercent = Math.round((quarterlyPending / totalQuarterlyTests) * 100);
  const overallOverduePercent = Math.round((quarterlyOverdue / totalQuarterlyTests) * 100);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as QuarterlyProgressItem;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono text-white space-y-1 z-50">
          <div className="font-bold text-slate-100 flex items-center justify-between gap-4">
            <span>{data.category}</span>
            <span className="text-[#FFB703] text-[10px]">{data.clause}</span>
          </div>
          <div className="text-slate-400 text-[11px]">Total Monitored Sites: {data.total}</div>
          <div className="pt-1.5 border-t border-slate-800 space-y-1">
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>✓ Completed & Logged:</span>
              <span className="font-bold">{data.completed} ({Math.round((data.completed / data.total) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-amber-400">
              <span>⏳ Pending Current Quarter:</span>
              <span className="font-bold">{data.pending} ({Math.round((data.pending / data.total) * 100)}%)</span>
            </div>
            {data.overdue > 0 && (
              <div className="flex items-center justify-between gap-4 text-rose-400">
                <span>⚠ Overdue SLA:</span>
                <span className="font-bold">{data.overdue} ({Math.round((data.overdue / data.total) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-6 shadow-xl">
      {/* Header with Title and Current Quarter Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
              SANS 10139 Statutory Routine Tracking
            </span>
            <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Q1 2026 Statutory Window
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Current Quarter Routine Inspection Progress
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time statutory completion rate across all commercial fire installations under SANS 10139:2012 Clause 25.
          </p>
        </div>

        {/* Big percentage summary badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              Quarterly Completion
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-end gap-1">
              <span>{overallCompletedPercent}%</span>
              <span className="text-xs font-normal text-slate-400">/ 100%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Linear Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Quarterly Inspection Distribution:</span>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Completed: {quarterlyCompleted} ({overallCompletedPercent}%)
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Pending: {quarterlyPending} ({overallPendingPercent}%)
            </span>
            {quarterlyOverdue > 0 && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Overdue: {quarterlyOverdue} ({overallOverduePercent}%)
              </span>
            )}
          </div>
        </div>

        {/* Multi-segmented high-contrast progress bar */}
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5 shadow-inner">
          <div
            style={{ width: `${overallCompletedPercent}%` }}
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 relative group"
            title={`Completed: ${overallCompletedPercent}%`}
          />
          <div
            style={{ width: `${overallPendingPercent}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Pending: ${overallPendingPercent}%`}
          />
          {overallOverduePercent > 0 && (
            <div
              style={{ width: `${overallOverduePercent}%` }}
              className="bg-rose-600 h-full rounded-r-full transition-all duration-500"
              title={`Overdue: ${overallOverduePercent}%`}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span>0% Quarter Target</span>
          <span>50% Mid-Quarter Milestone</span>
          <span className="text-emerald-400 font-bold">100% Statutory Compliance Target</span>
        </div>
      </div>

      {/* Recharts Bar Chart Breakdown by Statutory Interval */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Inspection Status by Statutory Interval (Recharts Visualization)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Source: Live SANS 10139 Site Profiles
          </span>
        </div>

        <div className="h-64 w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, totalSites]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortLabel"
                stroke="#94A3B8"
                fontSize={11}
                width={130}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#CBD5E1' }}
              />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statutory Insights Footer Note */}
      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white text-[11px]">
            SANS 10139:2012 Clause 25.2 Statutory Mandate:
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            During each quarterly inspection, at least one detector or manual call point per circuit or zone must be functionally tested to achieve 100% system rotation over a 12-month cycle. All findings must be recorded in the building's physical fire logbook and endorsed by a SAQCC-registered Master Practitioner.
          </p>
        </div>
      </div>
    </div>
  );
};
