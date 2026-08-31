import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IMiner } from "$lib/classes/gameData/buildings/IMiner";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";
import { NaturalRecipe } from "$lib/classes/gameData/recipes/NaturalRecipe";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import type { MineableData } from "$lib/data/types/buildings/MineableData";
import type { MinerData } from "$lib/data/types/buildings/MinerData";

export class Miner extends Building implements IMiner {
    private readonly _minerData: MinerData;

    public constructor(buildingData: BuildingData, minerData: MinerData) {
        super(buildingData);

        this._minerData = minerData;
    }

    public get mineableList(): readonly MineableData[] {
        return Object.values(this._minerData.mineable);
    }

    public getMineableData(itemId: string): MineableData | null {
        return this._minerData.mineable[itemId] ?? null;
    }

    public getRecipe(mineableItemId: string): INaturalRecipe | null {
        const mineableData = this.getMineableData(mineableItemId);

        if (!mineableData) {
            return null;
        }

        const ingredients: IItemStack[] = mineableData.consumeItem ? [mineableData.consumeItem] : [];
        const outcomes: IItemStack[] = [
            {
                itemId: mineableData.miningItemId,
                count: 1
            }
        ];

        return new NaturalRecipe(
            ingredients,
            outcomes,
            this.gameId,
            mineableData.miningTimeMs,
            mineableData.miningItemId
        );
    }

    public isMineable(itemId: string): boolean {
        return Object.hasOwn(this._minerData.mineable, itemId);
    }
}