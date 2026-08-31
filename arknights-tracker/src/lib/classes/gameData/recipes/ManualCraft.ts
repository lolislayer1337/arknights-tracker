import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import { Recipe } from "$lib/classes/gameData/recipes/Recipe";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export class ManualCraft extends Recipe implements IManualCraft {
    private readonly _gameId: string;
    private readonly _id: string;

    public constructor(ingredients: readonly IItemStack[], outcomes: readonly IItemStack[], gameId: string, id: string) {
        super(ingredients, outcomes);

        this._gameId = gameId;
        this._id = id;
    }

    public static createFromData(data: ManualCraftData): ManualCraft {
        return new ManualCraft(
            data.ingredients,
            data.outcomes,
            data.id,
            data.id
        );
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get id(): string {
        return this._id;
    }
}