import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export class MachineCraft extends BuildingRecipe implements IMachineCraft {
    private readonly _formulaGroupId: string;
    private readonly _gameId: string;
    private readonly _id: string;

    public constructor(ingredients: readonly IItemStack[], outcomes: readonly IItemStack[], buildingId: string, processTimeMs: number, formulaGroupId: string, gameId: string, id: string) {
        super(ingredients, outcomes, buildingId, processTimeMs);

        this._formulaGroupId = formulaGroupId;
        this._gameId = gameId;
        this._id = id;
    }

    public static createFromData(data: MachineCraftData): MachineCraft {
        return new MachineCraft(
            data.ingredients,
            data.outcomes,
            data.buildingId,
            data.craftTimeMs,
            data.formulaGroupId,
            data.id,
            data.id
        );
    }

    public get formulaGroupId(): string {
        return this._formulaGroupId;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get id(): string {
        return this._id;
    }
}