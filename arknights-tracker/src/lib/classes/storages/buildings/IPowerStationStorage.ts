import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IPowerStationStorage extends IGameDataStorage<IPowerStation> {}