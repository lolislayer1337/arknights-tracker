import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";

export interface IEquipableFood extends IFood {
    get condType(): EquipableItemConditionType;
    get condParams(): readonly string[];
    get castTime(): number;
    get castCount(): number;
    get castToMainCount(): number;
    get cooldown(): number;
    get recoverTime(): number;
    get recoverUpperCount(): number;
    get levelUpCastCount(): number;
    get levelUpRecoverUpperCount(): number;
}