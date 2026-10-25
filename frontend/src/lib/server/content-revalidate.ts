import { revalidatePath } from "next/cache";

const REVALIDATION_TARGETS: Record<string, string[]> = {
  news: ["/", "/news-events"],
  programmes: ["/", "/programmes"],
  events: ["/", "/news-events"],
  resources: ["/resources"],
  stories: ["/impact", "/about"],
  impact: ["/", "/impact", "/about"],
};

/**
 * Triggers Next.js on-demand path revalidation for public pages
 * so updates reflect immediately without site redeployment.
 */
export function revalidateContentPaths(contentType: string): void {
  try {
    const paths = REVALIDATION_TARGETS[contentType] || ["/"];
    for (const path of paths) {
      revalidatePath(path);
    }
  } catch (err) {
    console.warn(`[Revalidate Notice] Failed to revalidate paths for ${contentType}:`, err);
  }
}
