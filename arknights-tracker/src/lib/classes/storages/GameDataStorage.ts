import type { IGameData } from "$lib/classes/gameData/IGameData";
import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import { getMap } from "$lib/utils/collectionUtils";

export class GameDataStorage<T extends IGameData> extends DataStorage<T> implements IGameDataStorage<T> {
    private readonly _byGameId: Map<string, T>;

    public constructor(list: T[]) {
        super(list);

        this._byGameId = getMap(list, item => item.gameId);
    }

    public get byGameId(): ReadonlyMap<string, T> {
        return this._byGameId;
    }
}