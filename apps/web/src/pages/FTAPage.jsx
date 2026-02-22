import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Save, FileDown, Trash2, Edit, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';
import DiagramNode from '@/components/diagrams/DiagramNode.jsx';
import LogicGate from '@/components/diagrams/LogicGate.jsx';
import DiagramConnector from '@/components/diagrams/DiagramConnector.jsx';

const FTAPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [title, setTitle] = useState('');
  const [topEvent, setTopEvent] = useState('');
  const [structure, setStructure] = useState({
    topEvent: { id: 'top', text: '', x: 400, y: 50 },
    gates: [],
    intermediateEvents: [],
    basicEvents: []
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({ text: '', gateType: 'AND', parentId: '' });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const records = await pb.collection('fta_analyses').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setAnalyses(records);
    } catch (error) {
      console.error('Error fetching FTA analyses:', error);
    }
  };

  const handleAddEvent = (type) => {
    setModalType(type);
    setModalData({ text: '', gateType: 'AND', parentId: 'top' });
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (!modalData.text) {
      toast({
        title: "Validation Error",
        description: "Please enter event text.",
        variant: "destructive"
      });
      return;
    }

    const newStructure = { ...structure };
    const id = `${modalType}-${Date.now()}`;

    if (modalType === 'intermediate') {
      const yPos = 150 + (newStructure.intermediateEvents.length * 120);
      const xPos = 200 + (newStructure.intermediateEvents.length % 3) * 200;
      
      newStructure.gates.push({
        id: `gate-${id}`,
        type: modalData.gateType,
        x: xPos,
        y: yPos - 40,
        parentId: modalData.parentId
      });

      newStructure.intermediateEvents.push({
        id,
        text: modalData.text,
        x: xPos,
        y: yPos,
        gateId: `gate-${id}`
      });
    } else if (modalType === 'basic') {
      const yPos = 350 + (newStructure.basicEvents.length * 100);
      const xPos = 150 + (newStructure.basicEvents.length % 4) * 150;
      
      newStructure.basicEvents.push({
        id,
        text: modalData.text,
        x: xPos,
        y: yPos,
        parentGateId: modalData.parentId
      });
    }

    setStructure(newStructure);
    setShowModal(false);
    setModalData({ text: '', gateType: 'AND', parentId: '' });
  };

  const handleSave = async () => {
    if (!title || !topEvent) {
      toast({
        title: "Validation Error",
        description: "Please enter title and top event.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        user_id: currentUser.id,
        title,
        top_event: topEvent,
        structure: { ...structure, topEvent: { ...structure.topEvent, text: topEvent } },
        created_at: new Date().toISOString()
      };

      await pb.collection('fta_analyses').create(data, { $autoCancel: false });
      
      toast({
        title: "FTA Saved",
        description: "Fault Tree Analysis has been saved successfully."
      });

      setTitle('');
      setTopEvent('');
      setStructure({
        topEvent: { id: 'top', text: '', x: 400, y: 50 },
        gates: [],
        intermediateEvents: [],
        basicEvents: []
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error saving FTA:', error);
      toast({
        title: "Error",
        description: "Failed to save FTA analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FTA analysis?')) return;

    try {
      await pb.collection('fta_analyses').delete(id, { $autoCancel: false });
      toast({
        title: "FTA Deleted",
        description: "Analysis has been deleted successfully."
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error deleting FTA:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>FTA Analysis - SMART OSH</title>
        <meta name="description" content="Fault Tree Analysis for risk assessment" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Fault Tree Analysis (FTA)</h1>
          <p className="text-white/80">Systematic deductive failure analysis</p>
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
                placeholder="e.g., Equipment Failure Analysis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Event
              </label>
              <input
                type="text"
                value={topEvent}
                onChange={(e) => setTopEvent(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., System Failure"
              />
            </div>
          </div>
        </div>

        {/* FTA Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fault Tree Diagram</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddEvent('intermediate')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Intermediate Event
              </button>
              <button
                onClick={() => handleAddEvent('basic')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Basic Event
              </button>
            </div>
          </div>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
            <svg width="800" height="600" className="bg-gray-50 dark:bg-gray-900">
              {/* Top Event */}
              <DiagramNode
                type="rectangle"
                x={structure.topEvent.x}
                y={structure.topEvent.y}
                width={140}
                height={60}
                text={topEvent || 'Top Event'}
                fill="#0F172A"
              />

              {/* Gates and Intermediate Events */}
              {structure.gates.map((gate) => (
                <g key={gate.id}>
                  <DiagramConnector
                    x1={structure.topEvent.x}
                    y1={structure.topEvent.y + 30}
                    x2={gate.x}
                    y2={gate.y - 20}
                  />
                  <LogicGate type={gate.type} x={gate.x} y={gate.y} />
                </g>
              ))}

              {structure.intermediateEvents.map((event) => (
                <g key={event.id}>
                  <DiagramConnector
                    x1={event.x}
                    y1={event.y - 60}
                    x2={event.x}
                    y2={event.y - 30}
                  />
                  <DiagramNode
                    type="rectangle"
                    x={event.x}
                    y={event.y}
                    width={120}
                    height={50}
                    text={event.text}
                    fill="#1E293B"
                  />
                </g>
              ))}

              {/* Basic Events */}
              {structure.basicEvents.map((event) => (
                <g key={event.id}>
                  <DiagramConnector
                    x1={event.x}
                    y1={event.y - 80}
                    x2={event.x}
                    y2={event.y - 40}
                  />
                  <DiagramNode
                    type="circle"
                    x={event.x}
                    y={event.y}
                    width={80}
                    text={event.text}
                    fill="#F97316"
                  />
                </g>
              ))}
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
            Save FTA
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Previous FTA Analyses</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Top Event: {analysis.top_event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {analyses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No FTA analyses found.</p>
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
              Add {modalType === 'intermediate' ? 'Intermediate' : 'Basic'} Event
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={modalData.text}
                  onChange={(e) => setModalData({ ...modalData, text: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>

              {modalType === 'intermediate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gate Type
                  </label>
                  <select
                    value={modalData.gateType}
                    onChange={(e) => setModalData({ ...modalData, gateType: e.target.value })}
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
                  onClick={handleModalSubmit}
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

export default FTAPage;