import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/* scripts/lib/ sits two levels under the repository root. */
export const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const defaultOut = join(root, "site");
export const srcAssets = join(root, "src", "assets");
export const provenanceDir = join(root, "provenance");
export const officialK4vDir = join(root, "official-k4v");
export const predictionsDir = join(root, "predictions");
export const seasonManifest = join(root, "content", "season-01", "MANIFEST.json");
