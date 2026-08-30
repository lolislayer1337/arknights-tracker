import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IPowerRecipe extends IBuildingRecipe {
    get powerProvide(): number;
}