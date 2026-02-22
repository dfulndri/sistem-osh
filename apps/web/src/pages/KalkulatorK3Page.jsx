import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';

const KalkulatorK3Page = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [formData, setFormData] = useState({
    totalLTI: 0,
    totalIncidents: 0,
    totalWorkHours: 0,
    totalDaysLost: 0,
    employeesWithAPD: 0,
    totalEmployees: 0
  });

  useEffect(() => {
    fetchCalculations();
  }, []);

  const fetchCalculations = async () => {
    try {
      const records = await pb.collection('k3_calculations').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setCalculations(records);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

  const calculateMetrics = () => {
    const { totalLTI, totalIncidents, totalWorkHours, totalDaysLost, employeesWithAPD, totalEmployees } = formData;

    const ltir = totalWorkHours > 0 ? ((totalLTI / totalWorkHours) * 1000000).toFixed(2) : 0;
    const trir = totalWorkHours > 0 ? ((totalIncidents / totalWorkHours) * 200000).toFixed(2) : 0;
    const severityRate = totalIncidents > 0 ? (totalDaysLost / totalIncidents).toFixed(2) : 0;
    const frequencyRate = totalWorkHours > 0 ? ((totalIncidents / totalWorkHours) * 1000000).toFixed(2) : 0;
    const safeManHours = Math.max(0, totalWorkHours - (totalDaysLost * 8));
    const complianceAPD = totalEmployees > 0 ? ((employeesWithAPD / totalEmployees) * 100).toFixed(2) : 0;

    return { ltir, trir, severityRate, frequencyRate, safeManHours, complianceAPD };
  };

  const getMetricColor = (metric, value) => {
    const numValue = parseFloat(value);
    
    switch (metric) {
      case 'ltir':
      case 'trir':
      case 'frequencyRate':
        if (numValue <= 2) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        if (numValue <= 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      
      case 'complianceAPD':
        if (numValue >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        if (numValue >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const metrics = calculateMetrics();
      
      const data = {
        user_id: currentUser.id,
        ltir: parseFloat(metrics.ltir),
        trir: parseFloat(metrics.trir),
        severity_rate: parseFloat(metrics.severityRate),
        frequency_rate: parseFloat(metrics.frequencyRate),
        safe_man_hours: metrics.safeManHours,
        compliance_apd: parseFloat(metrics.complianceAPD),
        created_at: new Date().toISOString()
      };

      await pb.collection('k3_calculations').create(data, { $autoCancel: false });
      
      toast({
        title: "Calculation Saved",
        description: "K3 calculation has been saved successfully."
      });

      fetchCalculations();
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast({
        title: "Error",
        description: "Failed to save calculation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateMetrics();

  return (
    <>
      <Helmet>
        <title>Kalkulator K3 - SMART OSH</title>
        <meta name="description" content="Calculate occupational health and safety metrics" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Kalkulator K3</h1>
          <p className="text-white/80">Occupational Health & Safety Metrics Calculator</p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Input Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total LTI (Lost Time Injuries)
              </label>
              <input
                type="number"
                value={formData.totalLTI}
                onChange={(e) => setFormData({ ...formData, totalLTI: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Incidents
              </label>
              <input
                type="number"
                value={formData.totalIncidents}
                onChange={(e) => setFormData({ ...formData, totalIncidents: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Work Hours
              </label>
              <input
                type="number"
                value={formData.totalWorkHours}
                onChange={(e) => setFormData({ ...formData, totalWorkHours: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Days Lost
              </label>
              <input
                type="number"
                value={formData.totalDaysLost}
                onChange={(e) => setFormData({ ...formData, totalDaysLost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employees with APD
              </label>
              <input
                type="number"
                value={formData.employeesWithAPD}
                onChange={(e) => setFormData({ ...formData, employeesWithAPD: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Employees
              </label>
              <input
                type="number"
                value={formData.totalEmployees}
                onChange={(e) => setFormData({ ...formData, totalEmployees: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Calculated Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* LTIR */}
          <div className={`rounded-xl p-6 ${getMetricColor('ltir', metrics.ltir)}`}>
            <h3 className="text-sm font-medium mb-2">LTIR</h3>
            <p className="text-3xl font-bold mb-1">{metrics.ltir}</p>
            <p className="text-xs opacity-80">Lost Time Injury Rate per 1M hours</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${Math.min((parseFloat(metrics.ltir) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* TRIR */}
          <div className={`rounded-xl p-6 ${getMetricColor('trir', metrics.trir)}`}>
            <h3 className="text-sm font-medium mb-2">TRIR</h3>
            <p className="text-3xl font-bold mb-1">{metrics.trir}</p>
            <p className="text-xs opacity-80">Total Recordable Incident Rate</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${Math.min((parseFloat(metrics.trir) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Severity Rate */}
          <div className={`rounded-xl p-6 ${getMetricColor('severity', metrics.severityRate)}`}>
            <h3 className="text-sm font-medium mb-2">Severity Rate</h3>
            <p className="text-3xl font-bold mb-1">{metrics.severityRate}</p>
            <p className="text-xs opacity-80">Days lost per incident</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${Math.min((parseFloat(metrics.severityRate) / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Frequency Rate */}
          <div className={`rounded-xl p-6 ${getMetricColor('frequencyRate', metrics.frequencyRate)}`}>
            <h3 className="text-sm font-medium mb-2">Frequency Rate</h3>
            <p className="text-3xl font-bold mb-1">{metrics.frequencyRate}</p>
            <p className="text-xs opacity-80">Incidents per 1M hours</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${Math.min((parseFloat(metrics.frequencyRate) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Safe Man Hours */}
          <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2">Safe Man Hours</h3>
            <p className="text-3xl font-bold mb-1">{metrics.safeManHours.toLocaleString()}</p>
            <p className="text-xs opacity-80">Total safe working hours</p>
          </div>

          {/* APD Compliance */}
          <div className={`rounded-xl p-6 ${getMetricColor('complianceAPD', metrics.complianceAPD)}`}>
            <h3 className="text-sm font-medium mb-2">APD Compliance</h3>
            <p className="text-3xl font-bold mb-1">{metrics.complianceAPD}%</p>
            <p className="text-xs opacity-80">Personal Protective Equipment</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${metrics.complianceAPD}%` }}
              />
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">5x5 Risk Matrix</h2>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex">
                <div className="flex flex-col justify-around pr-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center py-2">Severity</div>
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center py-4">{s}</div>
                  ))}
                </div>
                
                <div>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(l => (
                      <div key={l} className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center w-20">{l}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 4, 3, 2, 1].map(severity => (
                      [1, 2, 3, 4, 5].map(likelihood => {
                        const score = severity * likelihood;
                        let bgColor = 'bg-green-500';
                        if (score > 5 && score <= 12) bgColor = 'bg-yellow-500';
                        else if (score > 12 && score <= 20) bgColor = 'bg-orange-500';
                        else if (score > 20) bgColor = 'bg-red-500';
                        
                        return (
                          <div
                            key={`${severity}-${likelihood}`}
                            className={`w-20 h-20 ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-transform`}
                          >
                            {score}
                          </div>
                        );
                      })
                    ))}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mt-2">Likelihood</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white font-semibold rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Calculation
          </button>
        </div>

        {/* Calculation History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calculation History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">LTIR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TRIR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">APD %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(calc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{calc.ltir}</td>
                    <td className="px-6 py-4 text-sm font-medium">{calc.trir}</td>
                    <td className="px-6 py-4 text-sm font-medium">{calc.compliance_apd}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {calculations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No calculations saved yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KalkulatorK3Page;