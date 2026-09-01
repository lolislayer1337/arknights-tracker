import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { FactoryEventData } from "$lib/data/types/events/FactoryEventData";
import type { ItemData } from "$lib/data/types/items/ItemData";
import { getMappedList } from "$lib/utils/collectionUtils";

export class ItemStorage extends GameDataStorage<IItem> implements IItemStorage {

    public constructor(itemDataStorage: IDataStorage<ItemData>, factoryEventDataStorage: IDataStorage<FactoryEventData>) {
        const list = ItemStorage.getList(itemDataStorage, factoryEventDataStorage);

        super(list);
    }

    private static getList(itemDataStorage: IDataStorage<ItemData>, factoryEventDataStorage: IDataStorage<FactoryEventData>): IItem[] {
        const eventMap = getMappedList(factoryEventDataStorage.list, item => item.eventItemIds);

        const result: IItem[] = [];

        for (const itemData of itemDataStorage.list) {
            const events = eventMap.get(itemData.id);
            const eventIds: string[] = events ? events.map(e => e.id) : [];

            result.push(new Item(itemData, eventIds));
        }

        return result;
    }
}