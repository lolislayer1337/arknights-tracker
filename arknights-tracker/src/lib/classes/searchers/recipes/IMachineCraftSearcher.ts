import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IMachineCraftSearchResult } from "$lib/classes/searchers/recipes/results/IMachineCraftSearchResult";

export interface IMachineCraftSearcher extends IBuildingRecipeSearcher<IMachineCraftSearchResult> {}