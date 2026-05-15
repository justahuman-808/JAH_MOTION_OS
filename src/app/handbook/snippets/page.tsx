import { DynamicSnippetLibrary as SnippetLibrary } from "@/components/ui/DynamicComponents";
import { getLiveDNA } from "@/lib/dna-service";

export default async function SnippetsPage() {
  const snippets = await getLiveDNA();

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Snippet Library</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          A centralized, searchable database of our After Effects expressions, typography fixes, and UI layout logic.
        </p>
      </div>

      <SnippetLibrary initialSnippets={snippets} />
    </div>
  );
}
