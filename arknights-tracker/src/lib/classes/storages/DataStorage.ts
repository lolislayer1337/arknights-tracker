import type { IData } from "$lib/classes/IData";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { ListStorage } from "$lib/classes/storages/ListStorage";
import { getMap } from "$lib/utils/collectionUtils";

export class DataStorage<T extends IData> extends ListStorage<T> implements IDataStorage<T> {
    private readonly _byId: Map<string, T>;

    public constructor(list: readonly T[]) {
        super(list);

        this._byId = getMap(list, item => item.id);
    }

    public get byId(): ReadonlyMap<string, T> {
        return this._byId;
    }
}