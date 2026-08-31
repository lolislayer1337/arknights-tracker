import type { IFuel } from "$lib/classes/gameData/items/IFuel";
import type { IListStorage } from "$lib/classes/storages/IListStorage";

export interface IFuelStorage extends IListStorage<IFuel> {
    getById(fuelId: string): IFuel | null;
    getByGameId(fuelId: string): IFuel | null;
}