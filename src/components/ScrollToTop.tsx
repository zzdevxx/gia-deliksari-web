'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 const toggleVisibility = () => {
 if (window.scrollY > 400) {
 setIsVisible(true);
 } else {
 setIsVisible(false);
 }
 };

 window.addEventListener('scroll', toggleVisibility, { passive: true });
 return () => window.removeEventListener('scroll', toggleVisibility);
 }, []);

 const scrollToTop = () => {
 window.scrollTo({
 top: 0,
 behavior: 'smooth',
 });
 };

 if (!isVisible) return null;

 return (
 <button
 onClick={scrollToTop}
 aria-label="Kembali ke atas halaman"
 // Was bg-amber-600 — an undoclumented off-palette hue on the one control
 // present on every route, and amber at this lightness reads orange-brown
 // against the warm canvas (the exact failure the palette notes warn about).
 // The brand fill is the documented answer: white on #8E1533 is 9.11:1.
 className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-text)] focus-visible:ring-offset-2"
 >
 <ArrowUp className="w-5 h-5" />
 </button>
 );
}
