import React from 'react';
import { Helmet } from 'react-helmet';
import { Shield, GitBranch, Zap, Target, Calculator, FileText, Info, Building2 } from 'lucide-react';

const TentangSistemPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'AI-HIRADC',
      description: 'Identifikasi bahaya dan penilaian risiko yang didukung oleh kecerdasan buatan untuk memberikan rekomendasi kontrol yang akurat.'
    },
    {
      icon: GitBranch,
      title: 'Fault Tree Analysis (FTA)',
      description: 'Analisis deduktif sistematis untuk mengidentifikasi akar penyebab dari suatu kejadian yang tidak diinginkan (Top Event).'
    },
    {
      icon: Zap,
      title: 'Event Tree Analysis (ETA)',
      description: 'Analisis probabilistik induktif untuk mengevaluasi konsekuensi dari suatu kejadian awal (Initiating Event) melalui berbagai lapisan pelindung.'
    },
    {
      icon: Target,
      title: 'Cause Consequence Analysis (CCA)',
      description: 'Kombinasi FTA dan ETA untuk memvisualisasikan hubungan antara penyebab dan konsekuensi dari suatu kejadian kritis.'
    },
    {
      icon: Calculator,
      title: 'Kalkulator K3',
      description: 'Perhitungan otomatis metrik keselamatan kerja seperti LTIR, TRIR, Severity Rate, dan Frequency Rate secara real-time.'
    },
    {
      icon: FileText,
      title: 'Laporan Terpadu',
      description: 'Sistem pelaporan komprehensif yang mengintegrasikan seluruh hasil analisis risiko dalam satu dashboard yang mudah diakses.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Tentang Sistem - SMART OSH</title>
        <meta name="description" content="Informasi tentang platform SMART OSH dan institusi pengembang" />
      </Helmet>

      <div className="space-y-8 pb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-8 lg:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-[#F97316] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-4xl font-bold text-white">SO</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">Tentang SMART OSH</h1>
            <p className="text-lg lg:text-xl text-white/80 font-light">
              Sistem Manajemen Keselamatan dan Kesehatan Kerja Terpadu
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apa itu SMART OSH?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                SMART OSH adalah platform digital integrasi untuk manajemen Keselamatan dan Kesehatan Kerja yang dirancang untuk praktisi K3 dalam melakukan identifikasi bahaya, penilaian risiko (HIRADC), analisis kesalahan (FTA, ETA, CCA), serta pelaporan komprehensif berbasis data.
              </p>
            </div>
          </div>
        </div>

        {/* Institution Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-[#F97316]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Institusi Pengembang</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Dikembangkan oleh <strong>Politeknik Ketenagakerjaan</strong>, sistem ini merupakan wujud dedikasi institusi dalam memajukan standar Keselamatan dan Kesehatan Kerja (K3) di Indonesia melalui inovasi teknologi dan digitalisasi proses analisis risiko industri.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-2">Fitur Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-[#0F172A] dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Dikembangkan oleh Politeknik Ketenagakerjaan
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Jalan Pengantin Ali No. 71 A, Ciracas, Jakarta Timur | support@polteknaker.ac.id
          </p>
        </div>
      </div>
    </>
  );
};

export default TentangSistemPage;