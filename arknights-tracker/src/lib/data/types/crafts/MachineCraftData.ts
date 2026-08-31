import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IData } from "$lib/classes/IData";

export interface MachineCraftData extends IData {
    readonly formulaGroupId: string;
    readonly buildingId: string;
    readonly craftTimeMs: number;
    readonly ingredients: readonly IItemStack[];
    readonly outcomes: readonly IItemStack[];
}