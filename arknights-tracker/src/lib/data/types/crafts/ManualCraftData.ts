import type { ItemStackData } from "$lib/classes/gameData/items/ItemStackData";
import type { IData } from "$lib/classes/IData";

export interface ManualCraftData extends IData {
    readonly ingredients: readonly ItemStackData[];
    readonly outcomes: readonly ItemStackData[];
}