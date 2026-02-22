import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Save, FileDown, Trash2, Edit, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';

const AIHIRADCPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [formData, setFormData] = useState({
    nama_aktivitas: '',
    lokasi: '',
    potensi_bahaya: '',
    severity: 3,
    likelihood: 3
  });
  const [aiInsight, setAiInsight] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const records = await pb.collection('hiradc_analyses').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setAnalyses(records);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const calculateRiskScore = () => {
    return formData.severity * formData.likelihood;
  };

  const getRiskCategory = (score) => {
    if (score <= 5) return { label: 'Low', color: 'bg-green-500' };
    if (score <= 12) return { label: 'Medium', color: 'bg-yellow-500' };
    if (score <= 20) return { label: 'High', color: 'bg-orange-500' };
    return { label: 'Extreme', color: 'bg-red-500' };
  };

  const getSliderColor = (value) => {
    if (value === 1) return 'bg-green-500';
    if (value === 2) return 'bg-yellow-300';
    if (value === 3) return 'bg-yellow-500';
    if (value === 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const generateAIInsight = () => {
    const riskScore = calculateRiskScore();
    const riskCategory = getRiskCategory(riskScore);
    
    const insight = `Analisis risiko untuk aktivitas "${formData.nama_aktivitas}" di lokasi ${formData.lokasi} menunjukkan potensi bahaya: ${formData.potensi_bahaya}. 

Dengan tingkat keparahan (severity) ${formData.severity} dan kemungkinan kejadian (likelihood) ${formData.likelihood}, risiko ini dikategorikan sebagai ${riskCategory.label} dengan skor risiko ${riskScore}.

Rekomendasi pengendalian yang harus diterapkan secara hierarkis:
1. Eliminasi - Menghilangkan bahaya sepenuhnya dari proses kerja
2. Substitusi - Mengganti dengan material atau proses yang lebih aman
3. Engineering Controls - Implementasi sistem teknis untuk mengurangi risiko
4. Administrative Controls - Prosedur kerja, pelatihan, dan rotasi pekerja
5. Alat Pelindung Diri (APD) - Sebagai kontrol terakhir

${riskCategory.label === 'High' || riskCategory.label === 'Extreme' 
  ? 'PERHATIAN: Risiko ini memerlukan tindakan segera dan pengendalian ketat sebelum aktivitas dilanjutkan.' 
  : 'Tetap lakukan monitoring berkala dan evaluasi efektivitas kontrol yang diterapkan.'}`;

    setAiInsight(insight);
    toast({
      title: "AI Insight Generated",
      description: "Professional risk analysis narrative has been created."
    });
  };

  const handleSave = async () => {
    if (!formData.nama_aktivitas || !formData.lokasi || !formData.potensi_bahaya) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const riskScore = calculateRiskScore();
      const riskCategory = getRiskCategory(riskScore);
      
      const data = {
        user_id: currentUser.id,
        nama_aktivitas: formData.nama_aktivitas,
        lokasi: formData.lokasi,
        potensi_bahaya: formData.potensi_bahaya,
        severity: formData.severity,
        likelihood: formData.likelihood,
        risk_score: riskScore,
        risk_category: riskCategory.label,
        rekomendasi_kontrol: [
          'Eliminasi',
          'Substitusi',
          'Engineering Controls',
          'Administrative Controls',
          'Alat Pelindung Diri (APD)'
        ],
        ai_insight: aiInsight || '',
        created_at: new Date().toISOString()
      };

      if (editingId) {
        await pb.collection('hiradc_analyses').update(editingId, data, { $autoCancel: false });
        toast({
          title: "Analysis Updated",
          description: "HIRADC analysis has been updated successfully."
        });
      } else {
        await pb.collection('hiradc_analyses').create(data, { $autoCancel: false });
        toast({
          title: "Analysis Saved",
          description: "HIRADC analysis has been saved successfully."
        });
      }

      setFormData({
        nama_aktivitas: '',
        lokasi: '',
        potensi_bahaya: '',
        severity: 3,
        likelihood: 3
      });
      setAiInsight('');
      setEditingId(null);
      fetchAnalyses();
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (analysis) => {
    setFormData({
      nama_aktivitas: analysis.nama_aktivitas,
      lokasi: analysis.lokasi,
      potensi_bahaya: analysis.potensi_bahaya,
      severity: analysis.severity,
      likelihood: analysis.likelihood
    });
    setAiInsight(analysis.ai_insight || '');
    setEditingId(analysis.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await pb.collection('hiradc_analyses').delete(id, { $autoCancel: false });
      toast({
        title: "Analysis Deleted",
        description: "HIRADC analysis has been deleted successfully."
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Feature",
      description: "🚧 PDF export feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const riskScore = calculateRiskScore();
  const riskCategory = getRiskCategory(riskScore);

  return (
    <>
      <Helmet>
        <title>AI-HIRADC Analysis - SMART OSH</title>
        <meta name="description" content="Hazard Identification, Risk Assessment and Determining Control with AI assistance" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">AI-HIRADC Analysis</h1>
          <p className="text-white/80">Hazard Identification, Risk Assessment and Determining Control</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit Analysis' : 'New Analysis'}
          </h2>

          <div className="space-y-6">
            {/* Nama Aktivitas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Aktivitas *
              </label>
              <input
                type="text"
                value={formData.nama_aktivitas}
                onChange={(e) => setFormData({ ...formData, nama_aktivitas: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Pengoperasian Mesin Bubut"
              />
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lokasi *
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Workshop Area A"
              />
            </div>

            {/* Potensi Bahaya */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potensi Bahaya *
              </label>
              <textarea
                value={formData.potensi_bahaya}
                onChange={(e) => setFormData({ ...formData, potensi_bahaya: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Describe potential hazards..."
              />
            </div>

            {/* Severity Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity (Keparahan): {formData.severity}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #22c55e 0%, #22c55e 20%, 
                      #fde047 20%, #fde047 40%, 
                      #eab308 40%, #eab308 60%, 
                      #f97316 60%, #f97316 80%, 
                      #ef4444 80%, #ef4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>1 - Negligible</span>
                  <span>2 - Minor</span>
                  <span>3 - Moderate</span>
                  <span>4 - Major</span>
                  <span>5 - Catastrophic</span>
                </div>
              </div>
            </div>

            {/* Likelihood Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Likelihood (Kemungkinan): {formData.likelihood}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.likelihood}
                  onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #22c55e 0%, #22c55e 20%, 
                      #fde047 20%, #fde047 40%, 
                      #eab308 40%, #eab308 60%, 
                      #f97316 60%, #f97316 80%, 
                      #ef4444 80%, #ef4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>1 - Rare</span>
                  <span>2 - Unlikely</span>
                  <span>3 - Possible</span>
                  <span>4 - Likely</span>
                  <span>5 - Almost Certain</span>
                </div>
              </div>
            </div>

            {/* Risk Score Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Risk Score</p>
                <div className={`inline-block px-8 py-4 rounded-lg ${riskCategory.color}`}>
                  <p className="text-4xl font-bold text-white">{riskScore}</p>
                </div>
                <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Category: {riskCategory.label}
                </p>
              </div>
            </div>

            {/* Rekomendasi Kontrol */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Hierarchy of Controls (Rekomendasi Kontrol)
              </h3>
              <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F97316]">1.</span>
                  <span><strong>Eliminasi</strong> - Menghilangkan bahaya sepenuhnya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F97316]">2.</span>
                  <span><strong>Substitusi</strong> - Mengganti dengan yang lebih aman</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F97316]">3.</span>
                  <span><strong>Engineering Controls</strong> - Sistem teknis pengaman</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F97316]">4.</span>
                  <span><strong>Administrative Controls</strong> - Prosedur dan pelatihan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#F97316]">5.</span>
                  <span><strong>APD</strong> - Alat Pelindung Diri</span>
                </li>
              </ol>
            </div>

            {/* AI Insight */}
            {aiInsight && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Generated Insight
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{aiInsight}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateAIInsight}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Generate AI Insight
              </button>

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
                {editingId ? 'Update Analysis' : 'Save Analysis'}
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea580c] transition-colors"
              >
                <FileDown className="w-5 h-5" />
                Export PDF
              </button>

              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      nama_aktivitas: '',
                      lokasi: '',
                      potensi_bahaya: '',
                      severity: 3,
                      likelihood: 3
                    });
                    setAiInsight('');
                  }}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Previous Analyses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Previous Analyses</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Nama Aktivitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Risk Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyses.map((analysis) => {
                  const category = getRiskCategory(analysis.risk_score);
                  return (
                    <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {analysis.nama_aktivitas}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {analysis.lokasi}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analysis.risk_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${category.color}`}>
                          {analysis.risk_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(analysis)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(analysis.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {analyses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No analyses found. Create your first analysis above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIHIRADCPage;