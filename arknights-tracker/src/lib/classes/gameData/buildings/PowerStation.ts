import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IPowerStation } from "$lib/classes/gameData/buildings/IPowerStation";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";
import { PowerRecipe } from "$lib/classes/gameData/recipes/PowerRecipe";
import type { IFuelStorage } from "$lib/classes/storages/items/IFuelStorage";
import { fuel } from "$lib/data/items/fuel";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import type { PowerStationData } from "$lib/data/types/buildings/PowerStationData";

export class PowerStation extends Building implements IPowerStation {
    private readonly _powerStationData: PowerStationData;
    private readonly _fuelStorage: IFuelStorage;

    public constructor(buildingData: BuildingData, powerStationData: PowerStationData, fuelStorage: IFuelStorage) {
        super(buildingData);

        this._powerStationData = powerStationData;
        this._fuelStorage = fuelStorage;
    }

    public get enableFuelIds(): readonly string[] {
        return Object.keys(fuel);
    }

    public get msPerRound(): number {
        return this._powerStationData.msPerRound;
    }

    public isFuelEnabled(fuelId: string): boolean {
        return this.enableFuelIds.includes(fuelId);
    }

    public getRecipe(fuelId: string): IPowerRecipe | null {
        if (!this.isFuelEnabled(fuelId)) {
            return null;
        }

        const fuel = this._fuelStorage.getById(fuelId);

        if (!fuel) {
            return null;
        }

        const ingredients: IItemStack[] = [
            {
                itemId: fuel.gameId,
                count: 1
            }
        ];

        return new PowerRecipe(
            ingredients,
            this.gameId,
            fuel.progressRound * this.msPerRound,
            fuel.powerProvide
        );
    }
}