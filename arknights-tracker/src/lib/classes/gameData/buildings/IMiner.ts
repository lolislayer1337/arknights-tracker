import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";
import type { MineableData } from "$lib/data/types/buildings/MineableData";

export interface IMiner extends IBuilding {
    get mineableList(): readonly MineableData[];
    isMineable(itemId: string): boolean;
    getMineableData(itemId: string): MineableData | null;

    getRecipe(mineableItemId: string): INaturalRecipe | null;
}