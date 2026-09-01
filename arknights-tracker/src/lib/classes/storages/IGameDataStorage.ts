import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";

export interface IGameDataStorage<T extends IGameData> extends IDataStorage<T> {
    get byGameId(): ReadonlyMap<string, T>;
}