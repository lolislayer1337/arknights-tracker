import type { BuildingModeName } from "$lib/classes/gameData/buildings/BuildingModeName";

export interface CrafterModeData {
    readonly formulaGroupId: string;
    readonly modeName: `${BuildingModeName}`;
}