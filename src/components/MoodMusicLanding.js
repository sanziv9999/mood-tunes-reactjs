import React from 'react';
import Header from './CustomHeader';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import TestimonialsSection from './TestimonialsSection';
import DownloadSection from './DownloadSection';
import Footer from './CustomFooter';

function MoodMusicLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <TestimonialsSection />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
}

export default MoodMusicLanding;