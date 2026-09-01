import type { IReadonlyDataMap } from "$lib/classes/gameData/collections/IReadonlyDataMap";
import type { IFullGasJar } from "$lib/classes/gameData/items/IFullGasJar";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IFullGasJarStorage extends IGameDataStorage<IFullGasJar> {
    get byEmptyJarId(): IReadonlyDataMap<string, IFullGasJar[]>;
    get byGasId(): IReadonlyDataMap<string, IFullGasJar[]>;
}