import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IData } from "$lib/classes/IData";

export interface ManualCraftData extends IData {
    readonly ingredients: readonly IItemStack[];
    readonly outcomes: readonly IItemStack[];
}