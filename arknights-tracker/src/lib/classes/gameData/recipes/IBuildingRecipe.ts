import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IBuildingRecipe extends IRecipe {
    buildingId: string;
    processTimeMs: number;
}