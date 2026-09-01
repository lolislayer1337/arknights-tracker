export function getMap<K, V>(list: readonly V[], getKeyFn: (item: V) => K): Map<K, V> {
    const map = new Map<K, V>();

    for (const item of list) {
        map.set(getKeyFn(item), item);
    }

    return map;
}

export function getMappedList<K, V>(list: readonly V[], getKeyFn: (item: V) => K | readonly K[]): Map<K, V[]> {
    const map = new Map<K, V[]>();

    for (const item of list) {
        const keys = getKeyFn(item);

        if (Array.isArray(keys)) {
            for (const key of keys) {
                let itemList = map.get(key);

                if (!itemList) {
                    itemList = [];
                    map.set(key, itemList);
                }

                itemList.push(item);
            }
        } else {
            const key = keys as K;

            let itemList = map.get(key);

            if (!itemList) {
                itemList = [];
                map.set(key, itemList);
            }

            itemList.push(item);
        }
    }

    return map;
}