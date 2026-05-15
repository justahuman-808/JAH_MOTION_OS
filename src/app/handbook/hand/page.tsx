import { TactileCard } from "@/components/ui/TactileCard";
import { Hand, PenTool, Target } from "lucide-react";
import { MotionPreview } from "@/components/ui/MotionPreview";

export default function HandPage() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-accent-vibrant">
          <Hand size={40} />
          <h1 className="text-4xl font-bold">Hand: Creative Execution Layer</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          The human heart of our studio. Hand takes the technical DNA from the Brain and breathes life and artistic soul into it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TactileCard className="border-accent-vibrant/10">
            <div className="flex items-center gap-3 mb-4 text-accent-vibrant">
              <PenTool size={20} />
              <h3 className="font-bold text-xl">Artistic Control</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Human taste, timing, and composition. We use technical tools to enhance, not replace, our artistic intuition.
            </p>
            <MotionPreview type="perspective" className="aspect-[4/3] max-w-sm mx-auto" />
          </TactileCard>
        </div>

        <div className="space-y-8">
          <TactileCard className="border-accent-vibrant/10">
            <div className="flex items-center gap-3 mb-4 text-accent-vibrant">
              <Target size={20} />
              <h3 className="font-bold text-xl">AE Workflow</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Our After Effects environment is optimized for speed. Every exported snippet is ready to be tweaked by a human hand.
            </p>
            <div className="prose prose-invert text-gray-400 p-4 bg-black/40 rounded-xl border border-white/5 italic">
               &quot;Automate the logic, craft the timing.&quot;
            </div>
          </TactileCard>

          <section className="bg-neutral-dark p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-accent-vibrant">
               Tactile Maximalism
            </h2>
            <div className="prose prose-invert text-gray-400">
              <p>
                This is where our aesthetic philosophy takes shape. We layer textures, grain, and high-density visuals with kinetic typography to create a rich, tactile experience that feels both technical and organic.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
