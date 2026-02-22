import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Save, FileDown, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';
import DiagramNode from '@/components/diagrams/DiagramNode.jsx';
import LogicGate from '@/components/diagrams/LogicGate.jsx';
import DiagramConnector from '@/components/diagrams/DiagramConnector.jsx';

const CCAPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [title, setTitle] = useState('');
  const [criticalEvent, setCriticalEvent] = useState('');
  const [causeTree, setCauseTree] = useState([]);
  const [consequenceTree, setConsequenceTree] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [eventData, setEventData] = useState({ text: '', gateType: 'AND' });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const records = await pb.collection('cca_analyses').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setAnalyses(records);
    } catch (error) {
      console.error('Error fetching CCA analyses:', error);
    }
  };

  const handleAddEvent = (type) => {
    if (!eventData.text) {
      toast({
        title: "Validation Error",
        description: "Please enter event text.",
        variant: "destructive"
      });
      return;
    }

    const newEvent = {
      id: Date.now(),
      text: eventData.text,
      gateType: eventData.gateType
    };

    if (type === 'cause') {
      setCauseTree([...causeTree, newEvent]);
    } else {
      setConsequenceTree([...consequenceTree, newEvent]);
    }

    setEventData({ text: '', gateType: 'AND' });
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!title || !criticalEvent) {
      toast({
        title: "Validation Error",
        description: "Please enter title and critical event.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        user_id: currentUser.id,
        title,
        critical_event: criticalEvent,
        cause_tree: causeTree,
        consequence_tree: consequenceTree,
        created_at: new Date().toISOString()
      };

      await pb.collection('cca_analyses').create(data, { $autoCancel: false });
      
      toast({
        title: "CCA Saved",
        description: "Cause Consequence Analysis has been saved successfully."
      });

      setTitle('');
      setCriticalEvent('');
      setCauseTree([]);
      setConsequenceTree([]);
      fetchAnalyses();
    } catch (error) {
      console.error('Error saving CCA:', error);
      toast({
        title: "Error",
        description: "Failed to save CCA analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CCA analysis?')) return;

    try {
      await pb.collection('cca_analyses').delete(id, { $autoCancel: false });
      toast({
        title: "CCA Deleted",
        description: "Analysis has been deleted successfully."
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error deleting CCA:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>CCA Analysis - SMART OSH</title>
        <meta name="description" content="Cause Consequence Analysis for risk assessment" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Cause Consequence Analysis (CCA)</h1>
          <p className="text-white/80">Combined cause and consequence tree analysis</p>
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
                placeholder="e.g., Chemical Spill Analysis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Critical Event
              </label>
              <input
                type="text"
                value={criticalEvent}
                onChange={(e) => setCriticalEvent(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Tank Rupture"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setModalType('cause'); setShowModal(true); }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Cause Event
              </button>

              <button
                onClick={() => { setModalType('consequence'); setShowModal(true); }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Consequence Event
              </button>
            </div>
          </div>
        </div>

        {/* CCA Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">CCA Diagram</h2>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
            <svg width="1200" height="600" className="bg-gray-50 dark:bg-gray-900">
              {/* Cause Tree (Left) */}
              {causeTree.map((event, index) => {
                const yPos = 100 + (index * 100);
                return (
                  <g key={event.id}>
                    <DiagramConnector
                      x1={250}
                      y1={yPos}
                      x2={400}
                      y2={300}
                    />
                    <LogicGate type={event.gateType} x={200} y={yPos - 20} size={30} />
                    <DiagramNode
                      type="circle"
                      x={250}
                      y={yPos}
                      width={80}
                      text={event.text}
                      fill="#1E293B"
                    />
                  </g>
                );
              })}

              {/* Critical Event (Center) */}
              <DiagramNode
                type="rectangle"
                x={600}
                y={300}
                width={160}
                height={80}
                text={criticalEvent || 'Critical Event'}
                fill="#0F172A"
              />

              {/* Consequence Tree (Right) */}
              {consequenceTree.map((event, index) => {
                const yPos = 100 + (index * 100);
                return (
                  <g key={event.id}>
                    <DiagramConnector
                      x1={680}
                      y1={300}
                      x2={900}
                      y2={yPos}
                    />
                    <DiagramNode
                      type="hexagon"
                      x={950}
                      y={yPos}
                      width={100}
                      height={60}
                      text={event.text}
                      fill="#F97316"
                    />
                  </g>
                );
              })}

              {/* Labels */}
              <text x={200} y={40} fontSize="16" fontWeight="bold" fill="#0F172A" className="dark:fill-white">
                Causes
              </text>
              <text x={950} y={40} fontSize="16" fontWeight="bold" fill="#0F172A" className="dark:fill-white">
                Consequences
              </text>
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white font-semibold rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save CCA
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Previous CCA Analyses</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Critical Event: {analysis.critical_event}</p>
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
                <p className="text-gray-600 dark:text-gray-400">No CCA analyses found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add {modalType === 'cause' ? 'Cause' : 'Consequence'} Event
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventData.text}
                  onChange={(e) => setEventData({ ...eventData, text: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>

              {modalType === 'cause' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gate Type
                  </label>
                  <select
                    value={eventData.gateType}
                    onChange={(e) => setEventData({ ...eventData, gateType: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="AND">AND Gate</option>
                    <option value="OR">OR Gate</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddEvent(modalType)}
                  className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CCAPage;