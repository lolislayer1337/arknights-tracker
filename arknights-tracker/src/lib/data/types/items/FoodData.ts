import type { BlackboardData } from "$lib/data/types/BlackboardData";

export interface FoodData {
    readonly itemId: string;
    readonly duration: number;
    readonly stackingKey: "buff" | null;
    readonly buffs: readonly FoodBuffData[];
}

export interface FoodBuffData {
    readonly buffId: string;
    readonly blackboard: readonly BlackboardData[];
}