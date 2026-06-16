export class DraggableList {
    _itemList = [];

    _draggedItemId = null;
    _enteredItemId = null;

    /**
     * @param {string[]} itemList
     */
    constructor(itemList) {
        this._itemList = itemList;
    }

    get itemList() {
        return this._itemList;
    }

    /**
     * @param {string[]} itemList
     */
    set itemList(itemList) {
        this._itemList = itemList;
    }

    /**
     * @returns {string|null}
     */
    get draggedItemId() {
        return this._draggedItemId;
    }

    /**
     * @returns {string|null}
     */
    get enteredItemId() {
        return this._enteredItemId;
    }

    /**
     * @param {string} itemId
     */
    startDrag(itemId) {
        this._draggedItemId = itemId;
    }

    endDrag() {
        this._draggedItemId = null;
    }

    /**
     * @param {string} enteredItemId
     */
    onEnter(enteredItemId) {
        if (enteredItemId === this._draggedItemId) {
            return;
        }

        if (enteredItemId === this._enteredItemId) {
            return;
        }

        this._enteredItemId = enteredItemId;

        let draggedItemIndex = this._getItemIndex(this._draggedItemId);
        let enteredItemIndex = this._getItemIndex(enteredItemId);
        if (enteredItemIndex === -1 || draggedItemIndex === -1) {
            return;
        }

        this._replaceItem(draggedItemIndex, enteredItemIndex);
    }

    /**
     * @param {string} leavedItemId
     */
    onLeave(leavedItemId) {
        if (leavedItemId === this._draggedItemId) {
            return;
        }

        if (leavedItemId === this._enteredItemId) {
            this._enteredItemId = null;
        }
    }

    _replaceItem(oldIndex, newIndex) {
        const [replacedItem] = this._itemList.splice(oldIndex, 1);

        const adjustedIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;

        this._itemList.splice(adjustedIndex, 0, replacedItem);
    }

    _getItemIndex(itemId) {
        return this._itemList.indexOf(itemId);
    }
}