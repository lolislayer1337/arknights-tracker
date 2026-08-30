import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface INaturalRecipe extends IBuildingRecipe {
    get resourcePointId(): string;
}