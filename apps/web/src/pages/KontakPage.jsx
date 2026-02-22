import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast.js';

const KontakPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    pesan: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.email || !formData.pesan) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await pb.collection('contact_messages').create({
        ...formData,
        status: 'unread'
      }, { $autoCancel: false });

      toast({
        title: "Pesan Terkirim",
        description: "Terima kasih! Pesan Anda telah berhasil dikirim."
      });

      setFormData({ nama: '', email: '', pesan: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Kontak - SMART OSH</title>
        <meta name="description" content="Hubungi tim SMART OSH Politeknik Ketenagakerjaan" />
      </Helmet>

      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 lg:p-10 text-white shadow-md">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Hubungi Kami</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Punya pertanyaan atau butuh bantuan terkait SMART OSH? Tim kami siap membantu Anda.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Contact Form */}
          <div className="w-full lg:w-3/5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kirim Pesan</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white transition-shadow"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white transition-shadow"
                  placeholder="email@contoh.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pesan *
                </label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white transition-shadow resize-none"
                  placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea580c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* Right Column: Institution Info */}
          <div className="w-full lg:w-2/5">
            <div className="bg-[#0F172A] rounded-xl shadow-lg p-6 lg:p-8 text-white h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-8">Informasi Kontak</h2>
              
              <div className="space-y-8 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Alamat Institusi</h3>
                    <p className="text-white/80 leading-relaxed">
                      Politeknik Ketenagakerjaan<br />
                      Jalan Pengantin Ali No. 71 A<br />
                      Ciracas, Jakarta Timur
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email Support</h3>
                    <a href="mailto:support@polteknaker.ac.id" className="text-white/80 hover:text-[#F97316] transition-colors">
                      support@polteknaker.ac.id
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">SO</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">SMART OSH</p>
                    <p className="text-sm text-white/60">Risk Analysis System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KontakPage;