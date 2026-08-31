import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IBuildingModeList } from "$lib/classes/gameData/buildings/IBuildingModeList";

export interface ICrafter extends IBuilding {
    get modes(): IBuildingModeList;
}