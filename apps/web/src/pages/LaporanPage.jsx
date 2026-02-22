import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FileDown, Trash2, Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';

const LaporanPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allReports, filterType, searchQuery]);

  const fetchAllReports = async () => {
    try {
      const [hiradc, fta, eta, cca, k3] = await Promise.all([
        pb.collection('hiradc_analyses').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created_at',
          $autoCancel: false
        }),
        pb.collection('fta_analyses').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created_at',
          $autoCancel: false
        }),
        pb.collection('eta_analyses').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created_at',
          $autoCancel: false
        }),
        pb.collection('cca_analyses').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created_at',
          $autoCancel: false
        }),
        pb.collection('k3_calculations').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created_at',
          $autoCancel: false
        })
      ]);

      const combined = [
        ...hiradc.map(r => ({ ...r, type: 'HIRADC', title: r.nama_aktivitas, status: r.risk_category })),
        ...fta.map(r => ({ ...r, type: 'FTA', title: r.title, status: 'Completed' })),
        ...eta.map(r => ({ ...r, type: 'ETA', title: r.title, status: 'Completed' })),
        ...cca.map(r => ({ ...r, type: 'CCA', title: r.title, status: 'Completed' })),
        ...k3.map(r => ({ ...r, type: 'K3', title: `K3 Calculation - ${new Date(r.created_at).toLocaleDateString()}`, status: `LTIR: ${r.ltir}` }))
      ];

      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllReports(combined);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports.",
        variant: "destructive"
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...allReports];

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete this ${report.type} report?`)) return;

    try {
      const collectionMap = {
        'HIRADC': 'hiradc_analyses',
        'FTA': 'fta_analyses',
        'ETA': 'eta_analyses',
        'CCA': 'cca_analyses',
        'K3': 'k3_calculations'
      };

      await pb.collection(collectionMap[report.type]).delete(report.id, { $autoCancel: false });
      
      toast({
        title: "Report Deleted",
        description: `${report.type} report has been deleted successfully.`
      });

      fetchAllReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'HIRADC': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'FTA': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'ETA': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'CCA': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'K3': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  return (
    <>
      <Helmet>
        <title>Laporan - SMART OSH</title>
        <meta name="description" content="View all safety analysis reports" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Laporan (Reports)</h1>
          <p className="text-white/80">Comprehensive view of all safety analyses</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="HIRADC">HIRADC</option>
                <option value="FTA">FTA</option>
                <option value="ETA">ETA</option>
                <option value="CCA">CCA</option>
                <option value="K3">K3 Calculations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Search by title or type..."
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredReports.length} report(s)
            </p>
            <button
              onClick={() => toast({ title: "Export Feature", description: "🚧 Export all reports isn't implemented yet! 🚀" })}
              className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export All Reports
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Title/Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status/Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedReports.map((report) => (
                  <tr key={`${report.type}-${report.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toast({ title: "View Feature", description: "🚧 Detailed view isn't implemented yet! 🚀" })}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast({ title: "Export Feature", description: "🚧 PDF export isn't implemented yet! 🚀" })}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Export PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedReports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No reports found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LaporanPage;