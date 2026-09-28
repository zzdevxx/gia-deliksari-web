import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HospitalitySection from '@/components/HospitalitySection';
import AboutSection from '@/components/AboutSection';
import MinistriesSection from '@/components/MinistriesSection';
import SermonsSection from '@/components/SermonsSection';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import ScheduleSection from '@/components/ScheduleSection';
import OrganizationSection from '@/components/OrganizationSection';
import MinistryRegistrationSection from '@/components/MinistryRegistrationSection';
import GivingSection from '@/components/GivingSection';
import GallerySection from '@/components/GallerySection';
import LocationContactSection from '@/components/LocationContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#150B0D] text-[#1F1617] dark:text-[#F5EFEB] transition-colors">
      {/* Top Sticky Header */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero />
        <HospitalitySection />
        <AboutSection />
        <MinistriesSection />
        <SermonsSection />
        <AnnouncementBoard />
        <ScheduleSection />
        <OrganizationSection />
        <MinistryRegistrationSection />
        <GivingSection />
        <GallerySection />
        <LocationContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
