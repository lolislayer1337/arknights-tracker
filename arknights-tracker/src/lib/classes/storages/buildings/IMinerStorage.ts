import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IMinerStorage extends IGameDataStorage<IMiner> {}