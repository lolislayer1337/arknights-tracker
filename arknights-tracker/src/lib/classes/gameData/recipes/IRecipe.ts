import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface IRecipe {
    get ingredients(): readonly IItemStack[];
    get outcomes(): readonly IItemStack[];
}