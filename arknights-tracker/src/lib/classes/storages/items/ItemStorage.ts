import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { FullBottleData } from "$lib/data/types/items/FullBottleData";
import type { FullJarData } from "$lib/data/types/items/FullJarData";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class ItemStorage extends GameDataStorage<IItem> implements IItemStorage {

    public constructor(itemDataStorage: IDataStorage<ItemData>, fullBottleDataStorage: IDataStorage<FullBottleData>, fullJarDataStorage: IDataStorage<FullJarData>) {
        const list = ItemStorage.getList(itemDataStorage, fullBottleDataStorage, fullJarDataStorage);

        super(list);
    }

    private static getList(itemDataStorage: IDataStorage<ItemData>, fullBottleDataStorage: IDataStorage<FullBottleData>, fullJarDataStorage: IDataStorage<FullJarData>): IItem[] {
        const itemMap: Map<string, IItem> = new Map();
        const itemsWithSubIcons: ItemData[] = [];

        for (const itemData of itemDataStorage.list) {
            if (itemData.type === "full_bottle" || itemData.type === "full_gas_jar") {
                itemsWithSubIcons.push(itemData);

                continue;
            }

            itemMap.set(itemData.id, Item.createItemFromData(itemData));
        }

        for (const itemData of itemsWithSubIcons) {
            let subItemId: string;

            if (itemData.type === "full_bottle") {
                subItemId = fullBottleDataStorage.byId.getOrThrow(itemData.id).liquidId;
            } else {
                subItemId = fullJarDataStorage.byId.getOrThrow(itemData.id).gasId;
            }

            const subIcon = itemMap.get(subItemId)!.icon;

            itemMap.set(itemData.id, Item.createItemFromData(itemData, subIcon));
        }

        return [...itemMap.values()];
    }
}