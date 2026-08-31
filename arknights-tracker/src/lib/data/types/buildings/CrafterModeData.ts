import type { BuildingModeName } from "$lib/classes/gameData/buildings/BuildingModeName";
import type { IData } from "$lib/classes/IData";

export interface CrafterModeData extends IData {
    readonly modeName: `${BuildingModeName}`;
}