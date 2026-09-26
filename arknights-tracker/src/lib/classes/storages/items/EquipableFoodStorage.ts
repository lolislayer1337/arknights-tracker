import { EquipableFood } from "$lib/classes/gameData/items/equipable/EquipableFood";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IEquipableFood } from "$lib/classes/gameData/items/equipable/IEquipableFood";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import type { EquipableItemData } from "$lib/data/types/items/EquipableItemData";

export class EquipableFoodStorage extends GameDataStorage<IEquipableFood> {

    public constructor(list: IEquipableFood[]) {
        super(list);
    }

    public static create(dataList: readonly EquipableItemData[], foodStorage: IGameDataStorage<IFood>): EquipableFoodStorage {
        const list: IEquipableFood[] = [];

        for (const data of dataList) {
            const food = foodStorage.byGameId.getOrThrow(data.id);

            list.push(EquipableFood.createEquipableFoodFromFood(
                food,
                data.condType as EquipableItemConditionType,
                data.condParams,
                data.castTime,
                data.castCount,
                data.castToMainCount,
                data.cooldown,
                data.recoverTime,
                data.recoverUpperCount,
                data.levelUpCastCount,
                data.levelUpRecoverUpperCount,
            ));
        }

        return new EquipableFoodStorage(list);
    }
}