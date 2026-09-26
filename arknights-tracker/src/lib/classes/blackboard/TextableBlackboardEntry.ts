import { BlackboardEntry } from "$lib/classes/blackboard/BlackboardEntry";
import type { ITextableBlackboardEntry } from "$lib/classes/blackboard/ITextableBlackboardEntry";

export class TextableBlackboardEntry extends BlackboardEntry implements ITextableBlackboardEntry {
    private readonly _i18nKey: string;

    public constructor(key: string, value: number, i18nKey: string) {
        super(key, value);
        
        this._i18nKey = i18nKey;
    }

    public get i18nKey(): string {
        return this._i18nKey;
    }
}