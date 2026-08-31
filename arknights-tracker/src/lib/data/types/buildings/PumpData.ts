export interface PumpData {
    readonly id: string;
    readonly pumpTimeMs: number;
    readonly enableLiquidIds: readonly string[];
}