import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IMachineCraft extends IBuildingRecipe {
    get formulaGroupId(): string;
}