import type { IFuel } from "$lib/classes/gameData/items/IFuel";
import type { IListStorage } from "$lib/classes/storages/IListStorage";

export interface IFuelStorage extends IListStorage<IFuel> {
    get byId(): ReadonlyMap<string, IFuel>;
    get byGameId(): ReadonlyMap<string, IFuel>;
}