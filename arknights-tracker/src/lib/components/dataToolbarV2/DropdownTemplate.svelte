<script>
    import { t } from "$lib/i18n";

    export let showResetButton = false;

    export let onResetButton = () => {};
</script>

<div
    class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[350px] max-h-[85vh] sm:relative sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:transform-none sm:left-0 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-3 outline-none overflow-y-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|stopPropagation
    on:keydown|stopPropagation
>

    <div class="flex justify-between">

        <slot name="top" />

        {#if showResetButton}

            <div class="flex justify-end">

                <button
                    class="text-xs font-bold text-gray-500 mb-2 dark:text-gray-400 border border-gray-300 dark:border-[#444444] rounded-full px-4 py-1.5 hover:text-[#F9B90C] hover:border-[#F9B90C] hover:bg-white hover:dark:bg-[#FFB200]/80 hover:dark:border-[#FFB200] hover:dark:text-[#E0E0E0] transition-all uppercase tracking-wider"
                    on:click={onResetButton}
                >
                    {$t("sort.reset")}
                </button>

            </div>

        {/if}

    </div>

    <slot />

</div>