import type { IFuel } from "$lib/classes/gameData/items/IFuel";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IFuelStorage extends IGameDataStorage<IFuel> {}