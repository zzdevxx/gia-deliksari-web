'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  Droplet, 
  Users, 
  UserPlus, 
  Sparkles,
  HelpCircle,
  Clock,
  Check
} from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { dataStore } from '@/lib/storage';
import { MinistryRequest } from '@/types';

type ServiceType = 'prayer' | 'sacrament' | 'komsel' | 'volunteer';

export default function MinistryRegistrationSection() {
  const [activeTab, setActiveTab] = useState<ServiceType>('prayer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [prayerType, setPrayerType] = useState('Doa Kesembuhan');
  const [sacramentType, setSacramentType] = useState('Baptisan Selam');
  const [komselArea, setKomselArea] = useState('Deliksari / Sekaran');
  const [volunteerRole, setVolunteerRole] = useState('Pujian & Penyembahan (Worship/Musisi)');
  const [message, setMessage] = useState('');
  const [needPastoralVisit, setNeedPastoralVisit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let details = '';
    let headerText = '';
    let subType = '';

    if (activeTab === 'prayer') {
      headerText = 'Permohonan Doa & Konseling Pastoral';
      subType = prayerType;
      details = `Jenis Pokok: ${prayerType}\nPesan/Pokok Doa: ${message || '-'}\nPermohonan Kunjungan Selasa: ${needPastoralVisit ? 'Ya, Mohon Dikunjungi' : 'Tidak'}`;
    } else if (activeTab === 'sacrament') {
      headerText = 'Pendaftaran Sakramen & Pelayanan Kudus';
      subType = sacramentType;
      details = `Jenis Pelayanan: ${sacramentType}\nCatatan Tambahan: ${message || '-'}`;
    } else if (activeTab === 'komsel') {
      headerText = 'Pendaftaran Bergabung Komsel Ekklesia';
      subType = komselArea;
      details = `Area Tempat Tinggal: ${komselArea}\nCatatan: ${message || '-'}`;
    } else if (activeTab === 'volunteer') {
      headerText = 'Pendaftaran Pelayan Ibadah (Volunteer)';
      subType = volunteerRole;
      details = `Bidang Pelayanan: ${volunteerRole}\nPengalaman / Catatan: ${message || '-'}`;
    }

    let normalizedPhone = phone.trim();
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.slice(1);
    } else if (normalizedPhone.startsWith('+62')) {
      normalizedPhone = normalizedPhone.slice(1);
    }

    const newRequest: MinistryRequest = {
      id: `req-${Date.now()}`,
      type: activeTab,
      name,
      phone: normalizedPhone,
      subType,
      message,
      needPastoralVisit: activeTab === 'prayer' ? needPastoralVisit : false,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Save to Cloudflare D1 & LocalStorage
    try {
      await dataStore.saveMinistryRequest(newRequest);
    } catch (err) {
      console.warn('Failed saving request to database, continuing WhatsApp redirect:', err);
    }

    const fullMessage = `*Syalom GIA Deliksari Semarang*\n\n*${headerText}*\n\nNama: ${name}\nNo. WhatsApp: ${normalizedPhone}\n${details}\n\nTerima kasih, Tuhan Yesus Memberkati.`;

    const phoneTarget = process.env.NEXT_PUBLIC_CHURCH_WHATSAPP || '6289620961103';
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneTarget}&text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, '_blank');
    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
      setNeedPastoralVisit(false);
    }, 5000);
  };

  return (
    <section id="layanan" className="py-24 bg-[#FAF7F2] dark:bg-[#141312] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#665E55] dark:text-[#A8A196] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
            <span>Layanan Jemaat & Formulir Digital</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight">
            Bagaimana Kami Dapat Melayani Anda?
          </h2>
          <p className="text-[#665E55] dark:text-[#A8A196] text-base sm:text-lg leading-relaxed">
            Sampaikan pokok doa, pendaftaran sakramen baptisan, gabung kelompok sel, atau kerinduan melayani pekerjaan Tuhan.
          </p>
        </div>

        {/* 4 Tabs Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2 bg-[#F3EFE6] dark:bg-[#1D1B19] rounded-2xl sm:rounded-3xl border border-[#E5DFD5] dark:border-[#332F2B] mb-8">
          {[
            { id: 'prayer', label: 'Doa & Konseling', icon: HeartHandshake },
            { id: 'sacrament', label: 'Sakramen Kudus', icon: Droplet },
            { id: 'komsel', label: 'Komsel Ekklesia', icon: Users },
            { id: 'volunteer', label: 'Pelayan Ibadah', icon: UserPlus },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ServiceType)}
                className={`py-3 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white shadow-sm'
                    : 'text-[#665E55] dark:text-[#A8A196] hover:bg-white/60 dark:hover:bg-[#262421]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-sm">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF]">
                Formulir Berhasil Dikirim & Tersimpan!
              </h3>
              <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A196] max-w-md mx-auto">
                Permohonan Anda telah tercatat dalam sistem layanan gereja dan diteruskan ke WhatsApp Tim Pastoral GIA Deliksari.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    Nama Lengkap <span className="text-[#8B1E28] dark:text-[#E88086]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Andreas Handoko"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                      Nomor WhatsApp / HP <span className="text-[#8B1E28] dark:text-[#E88086]">*</span>
                    </label>
                    <span className="text-[10px] text-[#665E55] dark:text-[#A8A196]">
                      Aktif WhatsApp
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                    placeholder="Contoh: 081234567890"
                    pattern="^(\+62|62|0)8[1-9][0-9]{6,11}$"
                    title="Masukkan nomor WhatsApp Indonesia yang valid (contoh: 081234567890)"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Form Fields Based on Tab */}
              {activeTab === 'prayer' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                      Kategori Permohonan Doa
                    </label>
                    <select
                      value={prayerType}
                      onChange={(e) => setPrayerType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                    >
                      <option value="Doa Kesembuhan">Doa Kesembuhan / Sakit Penyakit</option>
                      <option value="Pemulihan Keluarga / Pernikahan">Pemulihan Keluarga / Pernikahan</option>
                      <option value="Pekerjaan & Studi">Pekerjaan, Usaha & Perkuliahan</option>
                      <option value="Konseling Pastoral Bersama Pendeta">Konseling Pastoral Empat Mata</option>
                      <option value="Ucapan Syukur">Ucapan Syukur / Kesaksian</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#8B1E28] dark:text-[#E88086] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
                        <span>Kunjungan Pastoral Hari Selasa</span>
                      </div>
                      <p className="text-[11px] text-[#665E55] dark:text-[#A8A196]">
                        Centang jika Anda / keluarga memohon kunjungan doa hamba Tuhan ke rumah/rumah sakit di hari Selasa.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needPastoralVisit}
                        onChange={(e) => setNeedPastoralVisit(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B1E28]"></div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'sacrament' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    Pilih Pelayanan Sakramen / Upacara Kudus
                  </label>
                  <select
                    value={sacramentType}
                    onChange={(e) => setSacramentType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                  >
                    <option value="Baptisan Selam">Baptisan Selam Dewasa</option>
                    <option value="Penyerahan Anak / Bayi">Penyerahan Anak / Bayi Dedication</option>
                    <option value="Pemberkatan Nikah Kudus">Pemberkatan Nikah Kudus</option>
                    <option value="Perjamuan Kudus di Rumah (Lansia/Sakit)">Perjamuan Kudus di Rumah (Lansia/Sakit)</option>
                  </select>
                </div>
              )}

              {activeTab === 'komsel' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    Wilayah / Area Domisili Tempat Tinggal
                  </label>
                  <select
                    value={komselArea}
                    onChange={(e) => setKomselArea(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                  >
                    <option value="Deliksari / Sukorejo">Komsel Wilayah Deliksari / Sukorejo</option>
                    <option value="Sekaran / Kampus UNNES (Mahasiswa)">Komsel Mahasiswa Sekaran / Sekitar UNNES</option>
                    <option value="Sampangan / Menoreh">Komsel Wilayah Sampangan / Menoreh</option>
                    <option value="Gunungpati Umum">Komsel Umum Wilayah Gunungpati</option>
                  </select>
                </div>
              )}

              {activeTab === 'volunteer' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    Bidang Pelayanan yang Dirindukan
                  </label>
                  <select
                    value={volunteerRole}
                    onChange={(e) => setVolunteerRole(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all"
                  >
                    <option value="Pujian & Penyembahan (Worship/Musisi)">Pujian & Penyembahan (WL / Singer / Pemain Musik)</option>
                    <option value="Multimedia, Slide & Live Streaming">Multimedia (Slide Operator, Sound System, Camera Streaming)</option>
                    <option value="Guru Sekolah Minggu (COC Kidz)">Guru Sekolah Minggu (COC Kidz)</option>
                    <option value="Penyambut Jemaat (Usher & Kolektan)">Penyambut Jemaat (Usher & Kolektan)</option>
                    <option value="Tim Kreatif & Sosial Media">Tim Kreatif, Fotografi & Sosial Media</option>
                  </select>
                </div>
              )}

              {/* Message Details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                  Pesan atau Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pokok doa, pertanyaan, atau catatan khusus Anda di sini..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-sm text-[#1C1917] dark:text-[#F5F3EF] focus:ring-2 focus:ring-[#8B1E28]/30 focus:border-[#8B1E28] outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span>{isSubmitting ? 'Menyimpan & Menghubungkan...' : 'Kirim Formulir ke Tim Pastoral'}</span>
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
