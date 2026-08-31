import type { IData } from "$lib/classes/IData";

export interface FuelData extends IData {
    powerProvide: number;
    progressRound: number;
}