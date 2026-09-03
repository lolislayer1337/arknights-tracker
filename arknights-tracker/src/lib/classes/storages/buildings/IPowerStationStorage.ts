import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";

export interface IPowerStationStorage extends IBuildingStorage<IPowerStation> {}