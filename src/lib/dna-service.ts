import { promises as fs } from "fs";
import path from "path";

export interface Snippet {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  tags: string | string[]; // backend uses string
  code?: string;
  parameters?: Record<string, string | number | boolean>;
}

interface RawSnippet {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string | string[];
  code?: string;
  params?: Record<string, string | number | boolean>;
  parameters?: Record<string, string | number | boolean>;
}

const API_BASE = process.env.STUDIO_API_BASE_URL?.trim() ?? "";
const DNA_CATEGORIES = ["motion", "typography", "ui", "library"] as const;

function normalizeSnippet(snippet: RawSnippet): Snippet {
  return {
    ...snippet,
    id: snippet.id,
    name: snippet.name,
    category: snippet.category ? snippet.category.charAt(0).toUpperCase() + snippet.category.slice(1) : "Unknown",
    subcategory: snippet.subcategory,
    description: snippet.description ?? "",
    tags: typeof snippet.tags === "string" ? snippet.tags.split(",") : (snippet.tags ?? []),
    code: snippet.code ?? "",
    parameters: snippet.parameters ?? {},
  };
}

async function loadLocalDNA(): Promise<Snippet[]> {
  const dnaRoot = path.join(process.cwd(), "dna");
  const snippets: Snippet[] = [];

  async function scanDir(dir: string, currentCategory: string) {
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await scanDir(fullPath, currentCategory);
        continue;
      }

      if (!file.endsWith(".json")) continue;

      try {
        const raw = await fs.readFile(fullPath, "utf8");
        const parsed = JSON.parse(raw) as RawSnippet;
        const id = parsed.id ?? `${currentCategory}-${file.replace(/\.json$/i, "")}`.toLowerCase();
        snippets.push(
          normalizeSnippet({
            ...parsed,
            id,
            category: parsed.category ?? currentCategory,
            parameters: parsed.params ?? parsed.parameters ?? {},
          })
        );
      } catch {
        // Skip invalid snippet files and continue rendering available ones.
      }
    }
  }

  for (const category of DNA_CATEGORIES) {
    const dir = path.join(dnaRoot, category);
    await scanDir(dir, category);
  }

  return snippets;
}

export async function getLiveDNA(): Promise<Snippet[]> {
  if (!API_BASE) {
    return loadLocalDNA();
  }

  try {
    const res = await fetch(`${API_BASE}/snippets?include_code=true`, {
      cache: "no-store", // Ensures we always bypass Next.js cache to hit the Python watch handler
    });

    if (!res.ok) {
      console.warn("FastAPI backend error. Falling back to local DNA:", res.statusText);
      return loadLocalDNA();
    }

    const data = (await res.json()) as RawSnippet[];

    // Normalize category tags for display compatibility.
    const normalized = data.map(normalizeSnippet);

    // Backward-compatible fallback: hydrate code and parameters from /snippet/{name}
    // when backend returns metadata-only rows.
    const hydrated = await Promise.all(
      normalized.map(async (snippet) => {
        if (snippet.code && snippet.code.trim().length > 0) {
          return snippet;
        }

        try {
          const detailRes = await fetch(`${API_BASE}/snippet/${encodeURIComponent(snippet.name)}`, {
            cache: "no-store",
          });
          if (!detailRes.ok) {
            return snippet;
          }
          const detail = (await detailRes.json()) as RawSnippet;
          return {
            ...snippet,
            code: detail.code ?? "",
            parameters: detail.params ?? detail.parameters ?? {}
          };
        } catch {
          return snippet;
        }
      })
    );

    return hydrated.length > 0 ? hydrated : loadLocalDNA();
  } catch {
    console.warn("Connection error to API. Falling back to local DNA.");
    return loadLocalDNA();
  }
}


