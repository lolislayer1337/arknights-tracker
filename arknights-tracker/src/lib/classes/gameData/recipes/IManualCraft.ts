import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IManualCraft extends IRecipe, IGameData {}