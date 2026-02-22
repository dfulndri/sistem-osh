import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Save, FileDown, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';
import DiagramNode from '@/components/diagrams/DiagramNode.jsx';
import DiagramConnector from '@/components/diagrams/DiagramConnector.jsx';

const ETAPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [title, setTitle] = useState('');
  const [initiatingEvent, setInitiatingEvent] = useState('');
  const [barriers, setBarriers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [barrierData, setBarrierData] = useState({ name: '', successRate: 0.9 });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const records = await pb.collection('eta_analyses').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setAnalyses(records);
    } catch (error) {
      console.error('Error fetching ETA analyses:', error);
    }
  };

  const handleAddBarrier = () => {
    if (!barrierData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter barrier name.",
        variant: "destructive"
      });
      return;
    }

    setBarriers([...barriers, { ...barrierData, id: Date.now() }]);
    setBarrierData({ name: '', successRate: 0.9 });
    setShowModal(false);
  };

  const calculateFrequency = (path) => {
    let freq = 1.0;
    path.forEach((success, index) => {
      const barrier = barriers[index];
      if (barrier) {
        freq *= success ? barrier.successRate : (1 - barrier.successRate);
      }
    });
    return freq.toFixed(4);
  };

  const generateOutcomes = () => {
    if (barriers.length === 0) return [];
    
    const numOutcomes = Math.pow(2, barriers.length);
    const outcomes = [];
    
    for (let i = 0; i < numOutcomes; i++) {
      const path = [];
      for (let j = 0; j < barriers.length; j++) {
        path.push((i & (1 << j)) !== 0);
      }
      outcomes.push({
        path,
        frequency: calculateFrequency(path),
        severity: path.every(p => p) ? 'Low' : path.some(p => !p) ? 'Medium' : 'High'
      });
    }
    
    return outcomes;
  };

  const handleSave = async () => {
    if (!title || !initiatingEvent) {
      toast({
        title: "Validation Error",
        description: "Please enter title and initiating event.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const outcomes = generateOutcomes();
      
      const data = {
        user_id: currentUser.id,
        title,
        initiating_event: initiatingEvent,
        barriers: barriers,
        outcomes: outcomes,
        created_at: new Date().toISOString()
      };

      await pb.collection('eta_analyses').create(data, { $autoCancel: false });
      
      toast({
        title: "ETA Saved",
        description: "Event Tree Analysis has been saved successfully."
      });

      setTitle('');
      setInitiatingEvent('');
      setBarriers([]);
      fetchAnalyses();
    } catch (error) {
      console.error('Error saving ETA:', error);
      toast({
        title: "Error",
        description: "Failed to save ETA analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ETA analysis?')) return;

    try {
      await pb.collection('eta_analyses').delete(id, { $autoCancel: false });
      toast({
        title: "ETA Deleted",
        description: "Analysis has been deleted successfully."
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error deleting ETA:', error);
    }
  };

  const outcomes = generateOutcomes();

  return (
    <>
      <Helmet>
        <title>ETA Analysis - SMART OSH</title>
        <meta name="description" content="Event Tree Analysis for risk assessment" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Event Tree Analysis (ETA)</h1>
          <p className="text-white/80">Inductive probabilistic risk assessment</p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Analysis Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Fire Safety Analysis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initiating Event
              </label>
              <input
                type="text"
                value={initiatingEvent}
                onChange={(e) => setInitiatingEvent(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Fire Detected"
              />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Barriers</h3>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Barrier
              </button>
            </div>

            {barriers.length > 0 && (
              <div className="space-y-2">
                {barriers.map((barrier, index) => (
                  <div key={barrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{barrier.name}</span>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        Success Rate: {(barrier.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <button
                      onClick={() => setBarriers(barriers.filter((_, i) => i !== index))}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ETA Diagram */}
        {barriers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Event Tree Diagram</h2>

            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
              <svg width="1000" height={Math.max(400, outcomes.length * 40)} className="bg-gray-50 dark:bg-gray-900">
                {/* Initiating Event */}
                <DiagramNode
                  type="rectangle"
                  x={100}
                  y={200}
                  width={140}
                  height={60}
                  text={initiatingEvent}
                  fill="#0F172A"
                />

                {/* Barriers and Branches */}
                {barriers.map((barrier, bIndex) => {
                  const xPos = 300 + (bIndex * 150);
                  
                  return (
                    <g key={barrier.id}>
                      <text
                        x={xPos}
                        y={30}
                        textAnchor="middle"
                        fill="#0F172A"
                        className="dark:fill-white"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {barrier.name}
                      </text>
                      
                      {outcomes.map((outcome, oIndex) => {
                        const yPos = 80 + (oIndex * 40);
                        const prevX = bIndex === 0 ? 170 : 300 + ((bIndex - 1) * 150);
                        
                        return (
                          <g key={`${bIndex}-${oIndex}`}>
                            <line
                              x1={prevX}
                              y1={bIndex === 0 ? 200 : yPos}
                              x2={xPos}
                              y2={yPos}
                              stroke="#F97316"
                              strokeWidth="2"
                            />
                            <text
                              x={xPos - 30}
                              y={yPos - 5}
                              fontSize="10"
                              fill={outcome.path[bIndex] ? '#22c55e' : '#ef4444'}
                              fontWeight="500"
                            >
                              {outcome.path[bIndex] ? 'Success' : 'Fail'}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Outcomes */}
                {outcomes.map((outcome, index) => {
                  const yPos = 80 + (index * 40);
                  const xPos = 300 + (barriers.length * 150);
                  
                  return (
                    <g key={index}>
                      <DiagramNode
                        type="rectangle"
                        x={xPos + 80}
                        y={yPos}
                        width={100}
                        height={30}
                        text={outcome.severity}
                        fill={outcome.severity === 'Low' ? '#22c55e' : outcome.severity === 'Medium' ? '#eab308' : '#ef4444'}
                      />
                      <text
                        x={xPos + 200}
                        y={yPos + 5}
                        fontSize="11"
                        fill="#0F172A"
                        className="dark:fill-white"
                      >
                        Freq: {outcome.frequency}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white font-semibold rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save ETA
          </button>

          <button
            onClick={() => toast({ title: "Export Feature", description: "🚧 PDF export isn't implemented yet! 🚀" })}
            className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea580c] transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Export PDF
          </button>
        </div>

        {/* Previous Analyses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Previous ETA Analyses</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Initiating Event: {analysis.initiating_event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(analysis.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {analyses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No ETA analyses found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Barrier</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barrier Name
                </label>
                <input
                  type="text"
                  value={barrierData.name}
                  onChange={(e) => setBarrierData({ ...barrierData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="e.g., Fire Suppression System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Success Rate: {(barrierData.successRate * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={barrierData.successRate}
                  onChange={(e) => setBarrierData({ ...barrierData, successRate: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBarrier}
                  className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
                >
                  Add Barrier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ETAPage;