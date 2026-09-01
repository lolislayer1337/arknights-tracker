import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";

export interface IItemStorage extends IDataStorage<IItem> {}