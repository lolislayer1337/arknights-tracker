import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";

export interface RecipeFilterValueMap {
    itemGroups: `${ItemGroup}`;
    itemTypes: `${ItemType}`;
    itemMaterials: `${ItemMaterial}` | "nonMaterial";
    rarity: Rarity;
    events: string | "nonEvent";
}

export type RecipeFilterGroup = keyof RecipeFilterValueMap;

export type RecipeFilterValue<K extends RecipeFilterGroup> = RecipeFilterValueMap[K];