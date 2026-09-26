import type { IEquipableFood } from "$lib/classes/gameData/items/equipable/IEquipableFood";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import { EquipableFoodStorage } from "$lib/classes/storages/items/EquipableFoodStorage";
import { equipableItemDataStorage } from "$lib/dataStorages/items/equipableItemDataStorage";
import { foodStorage } from "$lib/dataStorages/items/foodStorage";

export const equipableFoodStorage: IGameDataStorage<IEquipableFood> = EquipableFoodStorage.create(equipableItemDataStorage.list, foodStorage);