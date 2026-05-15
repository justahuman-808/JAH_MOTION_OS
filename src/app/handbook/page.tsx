import { DynamicWorkflowDiagram as WorkflowDiagram } from "@/components/ui/DynamicComponents";

export default function HandbookPage() {
  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Studio Handbook</h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Welcome to the Jah Creative Tech Lab operational manual. This document outlines our core philosophy, technical systems, and creative workflows.
        </p>
      </div>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-widest uppercase text-accent/50 text-sm">Interactive Workflow</h2>
        <WorkflowDiagram />
      </section>

      <section className="space-y-8 pt-12 border-t border-white/5">
        <h2 className="text-3xl font-bold">The Ecosystem</h2>
        <div className="prose prose-invert max-w-none text-gray-400 space-y-6 text-lg leading-relaxed">
          <p>
            Our studio operates on the <strong>Brain → Hand → Eye</strong> workflow. This system is designed to maximize human creativity by offloading repetitive technical logic to structured &quot;DNA&quot; snippets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="space-y-3">
              <h4 className="text-accent font-bold">Engine (Brain)</h4>
              <p className="text-sm">Technical foundation, reusable code, and motion logic database.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-accent-vibrant font-bold">Execution (Hand)</h4>
              <p className="text-sm">Human artistic craft, composition, and soul infused into motion.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold">Standard (Eye)</h4>
              <p className="text-sm">Quality auditing, brand compliance, and final aesthetic validation.</p>
            </div>
          </div>
          <p>
            By separating these layers, we ensure that every project benefits from optimized code while maintaining a unique, human-crafted feel. The Eye (Quality Loop) ensures that everything we produce adheres to the highest aesthetic and technical standards.
          </p>
        </div>
      </section>
    </div>
  );
}
