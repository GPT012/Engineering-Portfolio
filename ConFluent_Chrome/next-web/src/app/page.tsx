'use client';

import { Canvas3D } from '@/components/3d/Canvas3D';
import { HeroText } from '@/components/ui/HeroText';
import { FeaturesBento } from '@/components/ui/FeaturesBento';
import { InteractiveDemo } from '@/components/ui/InteractiveDemo';
import { SocialProof } from '@/components/ui/SocialProof';
import { BetaForm } from '@/components/ui/BetaForm';
import { Footer } from '@/components/layout/Footer';
import { useScroll, useSpring, motion } from 'framer-motion';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative w-full min-h-screen bg-black">
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-primary z-[10000] origin-left"
        style={{ scaleX }}
      />
      <div className="noise-overlay" />

      {/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden">
        <Canvas3D />
        <HeroText />
      </section>

      {/* Social Proof Stats */}
      <SocialProof />

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* Feature Bento Grid */}
      <FeaturesBento />

      {/* Beta Sign-up Form */}
      <BetaForm />

      {/* Footer */}
      <Footer />
    </main>
  );
}
