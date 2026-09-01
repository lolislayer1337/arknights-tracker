import type { ItemStackData } from "$lib/classes/gameData/items/ItemStackData";
import type { IData } from "$lib/classes/IData";

export interface MachineCraftData extends IData {
    readonly formulaGroupId: string;
    readonly buildingId: string;
    readonly craftTimeMs: number;
    readonly ingredients: readonly ItemStackData[];
    readonly outcomes: readonly ItemStackData[];
}