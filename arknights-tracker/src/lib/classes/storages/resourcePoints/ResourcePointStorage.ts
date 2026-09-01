import { DataMap } from "$lib/classes/gameData/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/gameData/collections/IReadonlyDataMap";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";

export class ResourcePointStorage extends GameDataStorage<IResourcePoint> implements IResourcePointStorage {
    private readonly _byItemId: IReadonlyDataMap<string, IResourcePoint>;

    public constructor(list: IResourcePoint[]) {
        super(list);

        this._byItemId = DataMap.create(list, item => item.item.gameId);
    }

    public get byItemId(): IReadonlyDataMap<string, IResourcePoint> {
        return this._byItemId;
    }
}