import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { IRecipeSearcher } from "$lib/classes/searchers/recipes/IRecipeSearcher";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";

export interface IManualCraftSearcher extends IRecipeSearcher<IRecipeSearchResult<IManualCraft>> {}