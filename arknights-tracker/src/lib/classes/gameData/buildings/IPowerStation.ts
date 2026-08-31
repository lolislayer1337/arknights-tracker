import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";

export interface IPowerStation extends IBuilding {
    get msPerRound(): number;
    get enableFuelIds(): readonly string[];

    isFuelEnabled(fuelId: string): boolean;

    getRecipe(fuelId: string): IPowerRecipe | null;
}