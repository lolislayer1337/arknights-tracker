import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";

export interface MineableData {
    readonly miningItemId: string;
    readonly miningTimeMs: number;
    readonly consumeItem: IItemStack | null;
}