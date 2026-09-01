import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IBuildingStorage extends IGameDataStorage<IBuilding> {}