import type { CrafterModeData } from "$lib/data/types/buildings/CrafterModeData";

export interface CrafterData {
    readonly id: string;
    readonly modeMap: readonly CrafterModeData[];
}