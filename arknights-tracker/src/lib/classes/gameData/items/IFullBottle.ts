import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IFullBottle extends IItem {
    get emptyBottleId(): string;
    get liquidId(): string;
}