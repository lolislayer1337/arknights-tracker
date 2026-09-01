import type { IReadonlyDataMap } from "$lib/classes/gameData/collections/IReadonlyDataMap";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";

export interface IResourcePointStorage extends IGameDataStorage<IResourcePoint> {
    get byItemId(): IReadonlyDataMap<string, IResourcePoint>;
}