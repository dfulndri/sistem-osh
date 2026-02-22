import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Activity,
  Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import KPICard from '@/components/KPICard.jsx';
import ChartContainer from '@/components/ChartContainer.jsx';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [kpiData, setKpiData] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [trirTrend, setTrirTrend] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const COLORS = {
    high: '#EF4444',   // Red
    medium: '#EAB308', // Yellow
    low: '#22C55E',    // Green
    accent: '#F97316', // Orange
    blue: '#3B82F6'    // Blue
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch analyses
      const analyses = await pb.collection('analyses').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      // Fetch K3 Calculations
      const k3Calcs = await pb.collection('k3_calculations').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      processData(analyses, k3Calcs);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processData = (analyses, k3Calcs) => {
    // 1. KPI Data & Risk Distribution
    let high = 0, medium = 0, low = 0;
    
    analyses.forEach(a => {
      const score = a.risk_score || 0;
      if (score >= 13) high++;
      else if (score >= 6) medium++;
      else low++;
    });

    setKpiData({
      total: analyses.length,
      high,
      medium,
      low
    });

    setRiskDistribution([
      { name: 'High Risk', value: high, color: COLORS.high },
      { name: 'Medium Risk', value: medium, color: COLORS.medium },
      { name: 'Low Risk', value: low, color: COLORS.low }
    ].filter(item => item.value > 0)); // Only show segments with data

    // 2. Monthly Trends (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    const d = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      last6Months.push({
        month: monthNames[pastDate.getMonth()],
        year: pastDate.getFullYear(),
        monthIndex: pastDate.getMonth(),
        count: 0,
        trir: 0
      });
    }

    // Process Analyses for Monthly Trend
    analyses.forEach(a => {
      const date = new Date(a.created);
      const monthData = last6Months.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
      if (monthData) {
        monthData.count++;
      }
    });

    setMonthlyTrend(last6Months.map(m => ({
      name: m.month,
      Analyses: m.count
    })));

    // Process K3 Calculations for TRIR Trend
    const trirData = [...last6Months];
    const trirCounts = {}; // To calculate average if multiple per month

    k3Calcs.forEach(k => {
      const date = new Date(k.created);
      const monthData = trirData.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
      if (monthData && k.trir !== undefined) {
        const key = `${monthData.year}-${monthData.monthIndex}`;
        if (!trirCounts[key]) {
          trirCounts[key] = { sum: 0, count: 0 };
        }
        trirCounts[key].sum += k.trir;
        trirCounts[key].count++;
        monthData.trir = parseFloat((trirCounts[key].sum / trirCounts[key].count).toFixed(2));
      }
    });

    setTrirTrend(trirData.map(m => ({
      name: m.month,
      TRIR: m.trir
    })));

    // 3. Recent Activities
    const recent = analyses.slice(0, 5).map(a => ({
      id: a.id,
      title: a.title || 'Untitled Analysis',
      type: a.type || 'General',
      score: a.risk_score || 0,
      date: a.created
    }));
    setRecentActivities(recent);
  };

  const getRiskBadge = (score) => {
    if (score >= 13) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">High Risk</span>;
    if (score >= 6) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Medium Risk</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Low Risk</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316] mx-auto"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - SMART OSH</title>
        <meta name="description" content="SMART OSH Risk Analysis Dashboard" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 lg:p-8 text-white shadow-lg border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-400">
              Welcome back, {currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}. Here is your safety performance summary.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total Analisis" 
            value={kpiData.total} 
            icon={FileText} 
            accentColor={COLORS.blue}
          />
          <KPICard 
            title="High Risk" 
            value={kpiData.high} 
            icon={ShieldAlert} 
            accentColor={COLORS.high}
          />
          <KPICard 
            title="Medium Risk" 
            value={kpiData.medium} 
            icon={AlertTriangle} 
            accentColor={COLORS.medium}
          />
          <KPICard 
            title="Low Risk" 
            value={kpiData.low} 
            icon={CheckCircle} 
            accentColor={COLORS.low}
          />
        </div>

        {/* Charts Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Risk Trend */}
          <ChartContainer 
            title="Monthly Analysis Trend" 
            subtitle="Number of risk analyses performed over the last 6 months"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: COLORS.accent }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Analyses" 
                  stroke={COLORS.accent} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0F172A', stroke: COLORS.accent, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: COLORS.accent, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Incident Rate (TRIR) */}
          <ChartContainer 
            title="Incident Rate (TRIR)" 
            subtitle="Total Recordable Incident Rate trend"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trirTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: '#1E293B', opacity: 0.4 }}
                />
                <Bar 
                  dataKey="TRIR" 
                  fill={COLORS.blue} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Charts Section 2 & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Pie Chart */}
          <div className="lg:col-span-1">
            <ChartContainer 
              title="Risk Distribution" 
              subtitle="Overall breakdown of identified risks"
            >
              {riskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Activity className="w-12 h-12 mb-2 opacity-20" />
                  <p>No risk data available</p>
                </div>
              )}
            </ChartContainer>
          </div>

          {/* Recent Activities Table */}
          <div className="lg:col-span-2 bg-[#0F172A] rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white tracking-wide">Recent Activities</h3>
              <p className="text-sm text-gray-400 mt-1">Latest risk analyses and assessments</p>
            </div>
            
            <div className="flex-grow overflow-x-auto">
              {recentActivities.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1E293B]/50 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Analysis Title</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Risk Level</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-[#1E293B]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{activity.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300 bg-gray-800 px-2.5 py-1 rounded-md border border-gray-700">
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getRiskBadge(activity.score)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(activity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <FileText className="w-10 h-10 mb-3 opacity-20" />
                  <p>No recent activities found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;