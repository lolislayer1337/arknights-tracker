import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface IRecipe extends IGameData {
    get ingredients(): IItemStack[];
    get outcomes(): IItemStack[];
}