<script>
    import {getRarityColor} from "$lib/utils/rarityUtils.js";
    import {Item} from "$lib/classes/items/Item.js";

    export let currentItemId = "";

    let item = Item.getItem(currentItemId);


</script>

<div class="flex-grow flex flex-col justify-start min-w-[300px] overflow-auto sticky top-10 h-[95vh]
    bg-white dark:bg-[#383838] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors">

    <div class="relative flex p-6 overflow-hidden border-b border-gray-200 dark:border-[#444]">
        <h2 class="font-sdk text-xl md:text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
            {currentItemId}
        </h2>
    </div>

    <div class="relative flex p-6 overflow-hidden">
        <h2 class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
            test
        </h2>
    </div>

</div>