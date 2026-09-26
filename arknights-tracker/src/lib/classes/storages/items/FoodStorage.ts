import { Food } from "$lib/classes/gameData/items/food/Food";
import { FoodBuff } from "$lib/classes/gameData/items/food/FoodBuff";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import type { FoodData } from "$lib/data/types/items/FoodData";

export class FoodStorage extends GameDataStorage<IFood> {

    public constructor(list: readonly IFood[]) {
        super(list);
    }

    public static create(dataList: readonly FoodData[], itemStorage: IGameDataStorage<IItem>): FoodStorage {
        const list: IFood[] = [];

        for (const data of dataList) {
            const item = itemStorage.byGameId.getOrThrow(data.id);
            const buffs = data.buffs.map(FoodBuff.createFromData);

            list.push(Food.createFoodFromItem(
                item,
                data.duration,
                buffs
            ));
        }

        return new FoodStorage(list);
    }
}