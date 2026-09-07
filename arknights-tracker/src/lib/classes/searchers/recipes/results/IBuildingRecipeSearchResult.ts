import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export interface IBuildingRecipeSearchResult<
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TGroup extends IResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome>,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
> extends IRecipeSearchResult<TRecipe, TIngredient, TOutcome> {
    groupByBuilding(): ReadonlyMap<string, TGroup>;
}