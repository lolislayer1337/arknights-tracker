import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface MachineCraftData {
    readonly id: string;
    readonly formulaGroupId: string;
    readonly buildingId: string;
    readonly craftTimeMs: number;
    readonly ingredients: readonly IItemStack[];
    readonly outcomes: readonly IItemStack[];
}