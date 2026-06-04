<script>
    import {FormulaTree} from "$lib/classes/formulaTree/FormulaTree.js";
    import {Item} from "$lib/classes/items/Item.js";
    import DragPlate from "$lib/components/DragPlate.svelte";

    let {
        startItemId = "item_plant_grass_1",
        startFormula
    } = $props();

    const tree = new FormulaTree();

    let startItem = $derived(Item.getItem(startItemId));

    $effect(() => {
        tree.setStartNode(startItem.id, startFormula);
    });

</script>

<DragPlate>
    <div class="h-20 w-20 bg-gray-600">

    </div>
</DragPlate>