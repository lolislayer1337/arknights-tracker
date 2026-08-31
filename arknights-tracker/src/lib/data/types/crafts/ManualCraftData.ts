import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface ManualCraftData {
    readonly id: string;
    readonly ingredients: readonly IItemStack[];
    readonly outcomes: readonly IItemStack[];
}