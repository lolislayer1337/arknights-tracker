import { Building } from "$lib/classes/gameData/buildings/Building";
import { BuildingModeList } from "$lib/classes/gameData/buildings/BuildingModeList";
import type { IBuildingModeList } from "$lib/classes/gameData/buildings/IBuildingModeList";
import type { ICrafter } from "$lib/classes/gameData/buildings/ICrafter";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import type { CrafterData } from "$lib/data/types/buildings/CrafterData";

export class Crafter extends Building implements ICrafter {
    private readonly _modes: IBuildingModeList;

    public constructor(buildingData: BuildingData, crafterData: CrafterData) {
        super(buildingData);

        this._modes = new BuildingModeList(Object.values(crafterData.modeMap));
    }

    public get modes(): IBuildingModeList {
        return this._modes;
    }
}