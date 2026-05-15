import { TactileCard } from "@/components/ui/TactileCard";
import { Brain, Code, Database, Zap } from "lucide-react";
import { MotionPreview } from "@/components/ui/MotionPreview";

export default function BrainPage() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-accent">
          <Brain size={40} />
          <h1 className="text-4xl font-bold">Brain: Motion System Engine</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          The technical foundation of our studio. Brain stores the structured Design DNA—reusable code, expressions, and templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TactileCard>
            <div className="flex items-center gap-3 mb-4 text-accent">
              <Database size={20} />
              <h3 className="font-bold text-xl">Design DNA Database</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Our library of motion snippets, UI components, and typographic rules stored in a queryable format for After Effects and web integration.
            </p>
            <MotionPreview type="stagger" className="aspect-[4/3] max-w-sm mx-auto" />
          </TactileCard>

          <TactileCard>
            <div className="flex items-center gap-3 mb-4 text-accent">
              <Code size={20} />
              <h3 className="font-bold text-xl">CLI Parameter System</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A command-line interface that allows us to customize snippets before export, ensuring technical precision with dynamic flexibility.
            </p>
            <div className="bg-black/60 p-4 rounded-xl font-mono text-xs text-accent/80 border border-white/5">
              $ brain export &quot;Button Bounce&quot; --duration 0.5s --amplitude 12
            </div>
          </TactileCard>
        </div>

        <div className="space-y-8">
          <section className="bg-neutral-dark p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Zap size={24} className="text-accent" />
              Core Principle: Zero-Repetition
            </h2>
            <div className="prose prose-invert text-gray-400">
              <p>
                We never write the same expression twice. If a motion logic is reusable, it becomes part of the Brain. This allows us to focus 100% of our creative energy on the artistic &quot;Hand&quot; layer.
              </p>
            </div>
            <MotionPreview type="bounce" className="aspect-video" />
          </section>
        </div>
      </div>
    </div>
  );
}
