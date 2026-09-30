import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HospitalitySection from '@/components/HospitalitySection';
import AboutSection from '@/components/AboutSection';
import ChurchHistorySection from '@/components/ChurchHistorySection';
import MinistriesSection from '@/components/MinistriesSection';
import QuickExploreHub from '@/components/QuickExploreHub';
import OrganizationSection from '@/components/OrganizationSection';
import LocationContactSection from '@/components/LocationContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#150B0D] text-[#1F1617] dark:text-[#F5EFEB] transition-colors">
      {/* Top Sticky Header */}
      <Navbar />

      {/* Main Page Flow - Focused on Church Welcome, Identity & History */}
      <main className="flex-1">
        <Hero />
        <HospitalitySection />
        <AboutSection />
        <ChurchHistorySection />
        <MinistriesSection />
        <QuickExploreHub />
        <OrganizationSection />
        <LocationContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
