import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HospitalitySection from '@/components/HospitalitySection';
import AboutSection from '@/components/AboutSection';
import MinistriesSection from '@/components/MinistriesSection';
import OrganizationSection from '@/components/OrganizationSection';
import LocationContactSection from '@/components/LocationContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#141312] text-[#1C1917] dark:text-[#F5F3EF] transition-colors">
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
