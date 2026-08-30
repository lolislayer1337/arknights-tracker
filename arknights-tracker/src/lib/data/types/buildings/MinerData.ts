import type { MineableData } from "$lib/data/types/buildings/MineableData";

export interface MinerData {
    readonly id: string;
    readonly mineable: Readonly<Record<string, MineableData>>;
}