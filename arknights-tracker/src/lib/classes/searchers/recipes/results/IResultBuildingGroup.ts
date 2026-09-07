import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IResultBuildingGroup<
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
> {
    get building(): TBuilding;
    get list(): readonly TRecipe[];
}