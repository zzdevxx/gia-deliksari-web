'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
 Upload, 
 X, 
 CheckCircle2, 
 Camera, 
 Sparkles, 
 AlertCircle,
 HardDrive,
 Calendar,
 User,
 Tag
} from 'lucide-react';
import { GalleryItem } from '@/types';
import { useFocusTrap } from '@/lib/useFocusTrap';

interface UploadPhotoModalProps {
 isOpen: boolean;
 onClose: () => void;
 onUploadSuccess: (item: GalleryItem) => void;
}

export default function UploadPhotoModal({ isOpen, onClose, onUploadSuccess }: UploadPhotoModalProps) {
 const [file, setFile] = useState<File | null>(null);
 const [previewUrl, setPreviewUrl] = useState<string | null>(null);
 const [title, setTitle] = useState('');
 const [category, setCategory] = useState<'ibadah' | 'worship' | 'youth' | 'komunitas' | 'umum'>('umum');
 const [uploaderName, setUploaderName] = useState('');
 const [date, setDate] = useState('Agustus 2026');
 const [isUploading, setIsUploading] = useState(false);
 const [uploadSuccess, setUploadSuccess] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

 if (!isOpen) return null;

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 const selectedFile = e.target.files[0];
 if (selectedFile.size > 10 * 1024 * 1024) {
 setErrorMsg('Ukuran file maksimal 10MB');
 return;
 }
 setFile(selectedFile);
 setPreviewUrl(URL.createObjectURL(selectedFile));
 setErrorMsg(null);
 if (!title) {
 setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
 }
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!file) {
 setErrorMsg('Silakan pilih file foto terlebih dahulu');
 return;
 }

 setIsUploading(true);
 setErrorMsg(null);

 const formData = new FormData();
 formData.append('file', file);
 formData.append('title', title);
 formData.append('category', category);
 formData.append('uploaderName', uploaderName || 'Jemaat');
 formData.append('date', date);

 try {
 const res = await fetch('/api/gallery/upload', {
 method: 'POST',
 body: formData,
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Gagal mengunggah foto');
 }

 setUploadSuccess(true);
 if (data.item) {
 onUploadSuccess(data.item);
 }

 setTimeout(() => {
 setUploadSuccess(false);
 setFile(null);
 setPreviewUrl(null);
 setTitle('');
 setUploaderName('');
 onClose();
 }, 2500);
 } catch (err: any) {
 setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah foto');
 } finally {
 setIsUploading(false);
 }
 };

 return (
 <div
 ref={dialogRef}
 role="dialog"
 aria-modal="true"
 aria-labelledby="upload-modal-title"
 tabIndex={-1}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
 <div
 onClick={(e) => e.stopPropagation()}
 className="w-full max-w-lg bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
 >
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-10 h-10 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--brand-text)] dark:text-[var(--brand-text)] flex items-center justify-center">
 <Camera className="w-5 h-5" />
 </div>
 <div>
 <h3 id="upload-modal-title" className="text-lg sm:text-xl font-extrabold text-[var(--foreground)] dark:text-white">
 Unggah Dokumentasi Momen
 </h3>
 <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Foto akan diarsipkan di Google Drive & tampil di Galeri Web
 </p>
 </div>
 </div>
 <button 
 onClick={onClose}
 className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {uploadSuccess ? (
 <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center mx-auto">
 <CheckCircle2 className="w-8 h-8" />
 </div>
 <h4 className="text-xl font-extrabold text-[var(--foreground)] dark:text-white">
 Foto Berhasil Diunggah!
 </h4>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-sm mx-auto">
 Momen indah Anda telah berhasil ditambahkan ke galeri dan diarsipkan ke Google Drive GIA Deliksari.
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 
 {/* Storage Policy Notice */}
 <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] flex items-start gap-2.5 text-[11px] text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] leading-relaxed">
 <HardDrive className="w-4 h-4 shrink-0 mt-0.5" />
 <span>
 <strong>Sistem Rolling Cloud</strong>: Foto disimpan abadi di Google Drive gereja, dan 50 foto terkini ditampilkan otomatis di website.
 </span>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[var(--brand-text)] text-xs font-bold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 {/* Dropzone / Preview Area */}
 <div 
 onClick={() => fileInputRef.current?.click()}
 className="group border-2 border-dashed border-[var(--border)] dark:border-[var(--border)] hover:border-[var(--brand)] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]"
 >
 <input
 ref={fileInputRef}
 type="file"
 accept="image/jpeg,image/png,image/webp,image/jpg"
 onChange={handleFileChange}
 className="hidden"
 />

 {previewUrl ? (
 <div className="relative w-full h-40 rounded-xl overflow-hidden">
 <Image
 src={previewUrl}
 alt="Preview"
 fill
 className="object-cover"
 />
 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold">
 Klik untuk ganti foto
 </span>
 </div>
 </div>
 ) : (
 <div className="space-y-2 py-4">
 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[var(--card)] text-[var(--brand-text)] dark:text-[var(--brand-text)] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
 <Upload className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-bold text-[var(--foreground)] dark:text-white">
 Klik atau Seret Foto ke Sini
 </p>
 <p className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Format JPG, PNG, atau WebP (Maks. 10MB)
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Title */}
 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Judul / Keterangan Momen <span className="text-[var(--brand-text)] dark:text-[var(--brand-text)]">*</span>
 </label>
 <input
 type="text"
 required
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Contoh: Persekutuan Pemuda Youth Camp 2026"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
 />
 </div>

 {/* Category & Date */}
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Kategori</label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as any)}
 className="w-full px-3 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none"
 >
 <option value="ibadah">Ibadah Raya</option>
 <option value="worship">Praise & Worship</option>
 <option value="youth">Grow Youth</option>
 <option value="komunitas">Komunitas / Komsel</option>
 <option value="umum">Lainnya / Umum</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Waktu Kegiatan</label>
 <input
 type="text"
 value={date}
 onChange={(e) => setDate(e.target.value)}
 placeholder="Agustus 2026"
 className="w-full px-3 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none"
 />
 </div>
 </div>

 {/* Uploader Name */}
 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Nama Pengunggah / Tim Dokumentasi (Opsional)
 </label>
 <input
 type="text"
 value={uploaderName}
 onChange={(e) => setUploaderName(e.target.value)}
 placeholder="Contoh: Tim Multimedia / Andreas"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none"
 />
 </div>

 {/* Actions */}
 <div className="pt-3 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isUploading}
 className="px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={isUploading}
 className="px-6 py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer"
 >
 <Upload className="w-4 h-4" />
 <span>{isUploading ? 'Mengunggah & Sinkronisasi...' : 'Unggah Dokumentasi'}</span>
 </button>
 </div>

 </form>
 )}
 </div>
 </div>
 );
}
