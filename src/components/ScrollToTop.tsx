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
 className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400"
 >
 <ArrowUp className="w-5 h-5" />
 </button>
 );
}
