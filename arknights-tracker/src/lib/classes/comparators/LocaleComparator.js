import { IComparator } from "$lib/classes/comparators/IComparator.js";

export class LocaleComparator extends IComparator {
    _getLocaleFunc;

    constructor(getLocaleFunc) {
        super();

        this._getLocaleFunc = getLocaleFunc;
    }

    set getLocaleFunc(getLocaleFunc) {
        this._getLocaleFunc = getLocaleFunc;
    }

    compare(objA, objB) {
        let localeA = this._getLocale(objA);
        let localeB = this._getLocale(objB);

        if (localeA === null || localeB === null) {
            return 0;
        }

        return localeA.localeCompare(localeB);
    }

    _getLocale(obj) {
        return this._getLocaleFunc?.(obj) ?? null;
    }
}