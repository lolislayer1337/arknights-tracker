import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IMachineCraft extends IBuildingRecipe, IGameData {
    get formulaGroupId(): string;
}