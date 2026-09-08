import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";

export interface RecipeSortFieldParams {
    itemGroups: `${ItemGroup}`[];
    itemTypes: `${ItemType}`[];
    itemMaterials: `${ItemMaterial}`[];
    rarity: Rarity[];
    events: string[];
    localeName: LocaleOrder;
}