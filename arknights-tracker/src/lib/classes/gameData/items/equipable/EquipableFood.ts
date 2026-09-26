import  { type EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IEquipableFood } from "$lib/classes/gameData/items/equipable/IEquipableFood";
import { Food } from "$lib/classes/gameData/items/food/Food";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class EquipableFood extends Food implements IEquipableFood {
    private readonly _condType: EquipableItemConditionType;
    private readonly _condParams: readonly string[];
    private readonly _castTime: number;
    private readonly _castCount: number;
    private readonly _castToMainCount: number;
    private readonly _cooldown: number;
    private readonly _recoverTime: number;
    private readonly _recoverUpperCount: number;
    private readonly _levelUpCastCount: number;
    private readonly _levelUpRecoverUpperCount: number;


    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, duration: number, buffs: readonly IFoodBuff[], condType: EquipableItemConditionType, condParams: readonly string[], castTime: number, castCount: number, castToMainCount: number, cooldown: number, recoverTime: number, recoverUpperCount: number, levelUpCastCount: number, levelUpRecoverUpperCount: number) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon, duration, buffs);

        this._condType = condType;
        this._condParams = condParams;
        this._castTime = castTime;
        this._castCount = castCount;
        this._castToMainCount = castToMainCount;
        this._cooldown = cooldown;
        this._recoverTime = recoverTime;
        this._recoverUpperCount = recoverUpperCount;
        this._levelUpCastCount = levelUpCastCount;
        this._levelUpRecoverUpperCount = levelUpRecoverUpperCount;
    }

    public static createEquipableFoodFromFood(food: IFood, condType: EquipableItemConditionType, condParams: readonly string[], castTime: number, castCount: number, castToMainCount: number, cooldown: number, recoverTime: number, recoverUpperCount: number, levelUpCastCount: number, levelUpRecoverUpperCount: number): EquipableFood {
        return new EquipableFood(
            food.id,
            food.gameId,
            food.rarity,
            food.groupId,
            food.type,
            food.material,
            food.icon,
            food.subIcon,
            food.duration,
            food.buffs,
            condType,
            condParams,
            castTime,
            castCount,
            castToMainCount,
            cooldown,
            recoverTime,
            recoverUpperCount,
            levelUpCastCount,
            levelUpRecoverUpperCount,
        );
    }

    public get condType(): EquipableItemConditionType {
        return this._condType;
    }

    public get condParams(): readonly string[] {
        return this._condParams;
    }

    public get castTime(): number {
        return this._castTime;
    }

    public get castCount(): number {
        return this._castCount;
    }

    public get castToMainCount(): number {
        return this._castToMainCount;
    }

    public get cooldown(): number {
        return this._cooldown;
    }

    public get recoverTime(): number {
        return this._recoverTime;
    }

    public get recoverUpperCount(): number {
        return this._recoverUpperCount;
    }

    public get levelUpCastCount(): number {
        return this._levelUpCastCount;
    }

    public get levelUpRecoverUpperCount(): number {
        return this._levelUpRecoverUpperCount;
    }
}