import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HospitalitySection from '@/components/HospitalitySection';
import AboutSection from '@/components/AboutSection';
import MinistriesSection from '@/components/MinistriesSection';
import OrganizationSection from '@/components/OrganizationSection';
import LocationContactSection from '@/components/LocationContactSection';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] dark:bg-[#0F1115] text-[#111827] dark:text-[#F9FAFB] transition-colors">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Flow: Focused on Church Introduction, Vision & Pastoral Care */}
      <main className="flex-1">
        <Hero />
        <HospitalitySection />
        <AboutSection />
        <MinistriesSection />
        <OrganizationSection />
        <LocationContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
