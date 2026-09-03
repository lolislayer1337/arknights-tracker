import type { IMineable } from "$lib/classes/gameData/buildings/miners/IMineable";
import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import { Mineable } from "$lib/classes/gameData/buildings/miners/Mineable";
import { Miner } from "$lib/classes/gameData/buildings/miners/Miner";
import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { IMinerStorage } from "$lib/classes/storages/buildings/IMinerStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import type { MinerData } from "$lib/data/types/buildings/MinerData";

export class MinerStorage extends BuildingStorage<IMiner> implements IMinerStorage {

    public constructor(list: IMiner[]) {
        super(list);
    }

    public static createMinerStorage(dataStorage: IDataStorage<MinerData>, buildingStorage: IBuildingStorage, itemStorage: IItemStorage, resourcePointStorage: IResourcePointStorage): MinerStorage {
        const list: IMiner[] = [];

        for (const data of dataStorage.list) {
            const building = buildingStorage.byGameId.getOrThrow(data.id);
            const mineable: IMineable[] = Object.values(data.mineable)
                .map(item => new Mineable(
                    itemStorage.byGameId.getOrThrow(item.miningItemId),
                    resourcePointStorage.byItemId.get(item.miningItemId) ?? null,
                    item.miningTimeMs,
                    item.consumeItem
                        ? {
                            item: itemStorage.byGameId.getOrThrow(item.consumeItem.itemId),
                            count: item.consumeItem.count
                        }
                        : null
                ));

            list.push(Miner.createFromBuilding(building, mineable));
        }

        return new MinerStorage(list);
    }
}