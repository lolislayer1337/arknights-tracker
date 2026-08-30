import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";

export interface BuildingData {
    readonly id: string;
    readonly type: `${BuildingType}`;
    readonly itemId: string;
    readonly iconId: string;
}