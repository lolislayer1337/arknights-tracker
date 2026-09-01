import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IPowerStation } from "$lib/classes/gameData/buildings/IPowerStation";
import type { IFuel } from "$lib/classes/gameData/items/IFuel";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";
import { PowerRecipe } from "$lib/classes/gameData/recipes/PowerRecipe";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";

export class PowerStation extends Building implements IPowerStation {
    private readonly _msPerRound: number;
    private readonly _enableFuelList: readonly IFuel[];

    public constructor(buildingData: BuildingData, buildingItem: IItem, msPerRound: number, enableFuelList: readonly IFuel[]) {
        super(buildingData, buildingItem);

        this._msPerRound = msPerRound;
        this._enableFuelList = enableFuelList;
    }

    public get enableFuelList(): readonly IFuel[] {
        return this._enableFuelList;
    }

    public get msPerRound(): number {
        return this._msPerRound
    }

    public getEnableFuel(fuelId: string): IFuel | null {
        return this._enableFuelList.find(item => item.gameId === fuelId) ?? null;
    }

    public isFuelEnabled(fuelId: string): boolean {
        return this._enableFuelList.findIndex(item => item.gameId === fuelId) > -1;
    }

    public getRecipe(fuelId: string): IPowerRecipe | null {
        const fuel = this.getEnableFuel(fuelId);

        if (!fuel) {
            return null;
        }

        const ingredients: IItemStack<IFuel>[] = [
            {
                item: fuel,
                count: 1
            }
        ];

        return new PowerRecipe(
            ingredients,
            this,
            this._msPerRound * fuel.progressRound,
            fuel.powerProvide
        );
    }
}