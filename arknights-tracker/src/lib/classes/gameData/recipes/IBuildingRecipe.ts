import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IBuildingRecipe extends IRecipe {
    get buildingId(): string;
    get processTimeMs(): number;
}