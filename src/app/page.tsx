import { TactileButton } from "@/components/ui/TactileButton";
import { TactileCard } from "@/components/ui/TactileCard";
import { MoveRight, Zap, Target, Eye, BrainIcon, BrainCircuit, BrainCog, Brain, Hand } from "lucide-react";
import Link from "next/link";
import { DynamicGrainOverlay as GrainOverlay, DynamicKineticTypography as KineticTypography } from "@/components/ui/DynamicComponents";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <GrainOverlay />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-40 pb-20 text-white">
        <div className="max-w-7xl w-full text-center flex flex-col items-center">

          {/* Primary Line - Static Bold Sans-Serif */}
          <KineticTypography
            text="The Zero-Repetition"
            className="text-4xl md:text-7xl font-bold tracking-tighter leading-none z-20 mb-[-1.5rem] md:mb-[-2.5rem]"
            as="h1"
            trigger="load" 
          />

          {/* Hero Running Text Container - Fixed Collision & Strokes */}
          <div className="relative flex flex-col gap-2 md:gap-4 py-8 overflow-hidden pointer-events-none select-none mask-fade-out z-10">
            
            {/* Row 1: HUMAN-CRAFTED (Playfair Italic) */}
            <div className="flex animate-marquee-infinite whitespace-nowrap will-change-transform gap-12" style={{ animationDuration: '30s' }}>
              {[1, 2, 3, 4].map((i) => (
                <span 
                  key={`row1-${i}`}
                  className="text-[15vw] leading-none inline-block font-black tracking-[0.01em] font-playfair italic text-white/90 uppercase pr-[10vw]"
                >
                  HUMAN-CRAFTED
                </span>
              ))}
            </div>

            {/* Row 2: CREATIVE STUDIO (Inter Extra Bold Italic) */}
            <div 
              className="flex animate-marquee-infinite whitespace-nowrap hide-scrollbar will-change-transform gap-12" 
              style={{ animationDirection: 'reverse', animationDuration: '45s' }}
            >
              {[1, 2, 3, 4].map((i) => (
                <span 
                  key={`row2-${i}`}
                  className="text-[15vw] leading-none inline-block font-extrabold italic tracking-[-0.02em] font-sans text-white/80 uppercase"
                  style={{ fontOpticalSizing: 'auto' }}
                >
                  CREATIVE STUDIO
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 z-10">
            <Link href="/handbook">
              <TactileButton variant="primary" className="flex items-center gap-2">
                Explore Handbook <MoveRight size={20} />
              </TactileButton>
            </Link>
            <TactileButton variant="secondary">
              View DNA Samples
            </TactileButton>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-vibrant/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-4 bg-neutral-dark/50 relative border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-accent text-sm font-bold tracking-widest uppercase">Philosophy</h2>
            <h3 className="text-4xl md:text-6xl font-bold">Tactile Maximalism</h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              We combine structured Design DNA with raw human creativity to enable fast, repeatable workflows without sacrificing artistic soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TactileCard className="group hover:border-accent transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-6">
                <Brain size={24} />
              </div>
              <h4 className="text-xl font-bold mb-4">Brain: Motion Engine</h4>
              <p className="text-gray-400 leading-relaxed">Structured motion snippets and easing formulas that handle the technical complexity of AE animations.</p>
            </TactileCard>

            <TactileCard className="group hover:border-accent-vibrant transition-colors" delay={0.2}>
              <div className="w-12 h-12 bg-accent-vibrant/10 rounded-lg flex items-center justify-center text-accent-vibrant mb-6">
                <Hand size={24} />
              </div>
              <h4 className="text-xl font-bold mb-4">Hand: Creative Layer</h4>
              <p className="text-gray-400 leading-relaxed">Where human taste and philosophy take over, utilizing tools to craft high-density 3D UI and typography.</p>
            </TactileCard>

            <TactileCard className="group hover:border-white transition-colors" delay={0.4}>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white mb-6">
                <Eye size={24} />
              </div>
              <h4 className="text-xl font-bold mb-4">Eye: Quality Loop</h4>
              <p className="text-gray-400 leading-relaxed">Our feedback mechanism ensuring every frame meets the highest standards of brand compliance and craft.</p>
            </TactileCard>
          </div>
        </div>
      </section>

      {/* Burmese Typography Sample */}
      <section className="py-32 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8 text-center lg:text-left w-full">
            <h2 className="text-3xl md:text-6xl font-bold leading-tight">
              Crafting <span className="text-accent">Kinetic</span> Typography for Burmese
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              We&apos;ve developed specialized templates for Burmese Unicode that respect scaling, alignment, and the unique geometry of the script.
            </p>
            <div className="p-12 bg-neutral-dark rounded-3xl border border-white/10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <p 
                className="burmese-text text-5xl md:text-7xl text-center leading-relaxed font-bold"
                style={{ fontFamily: 'var(--font-padauk), sans-serif' }}
              >
                မြန်မာစာလုံး ပုံစံသစ်
              </p>
              <p className="text-center text-gray-500 mt-6 text-sm font-mono uppercase tracking-widest">
                [ Next-Gen Burmese Typography ]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-32 px-4 text-center space-y-12 border-t border-white/5">
        <h2 className="text-4xl font-bold">Ready to transcend repetition?</h2>
        <Link href="/handbook" className="inline-block">
          <TactileButton variant="primary">Enter the Handbook</TactileButton>
        </Link>
        <p className="text-gray-600 text-sm mt-20">
          © 2026 JAH_AI_STUDIO. Built for the future of motion.
        </p>
      </footer>
    </main>
  );
}