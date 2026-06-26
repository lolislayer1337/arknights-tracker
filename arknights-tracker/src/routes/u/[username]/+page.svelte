<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n.js";
    import { getUserProfileByName } from "$lib/api.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import { characters } from "$lib/data/characters.js";

    $: username = $page.params.username;

    let profile = null;
    let loading = true;
    let errorMsg = "";
    let selectedGameUid = null;

    const charactersById = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.id) acc[char.id] = char;
        return acc;
    }, {});

    function getSvelteCharId(char) {
        if (!char) return "";
        const rawName = char.charData?.name || char.name || "";
        const nameLower = rawName.toLowerCase().trim();

        const ruMapping = {
            "эндминистратор": "endministrator1",
            "перлика": "perlica",
            "арделия": "ardelia",
            "пограничник": "pogranichnik",
            "арклайт": "arclight",
            "авивенна": "avywenna",
            "светоснежка": "snowshine",
            "чэнь цяньюй": "chenQianyu",
            "да пан": "daPan",
            "алеш": "alesh",
            "эстелла": "estella",
            "кэтчер": "catcher",
            "флюорит": "fluorite",
            "акэкури": "akekuri",
            "антал": "antal",
            "лейватейн": "laevatain",
            "ивонн": "yvonne",
            "джилберта": "gilberta",
            "эмбер": "ember",
            "ласт райт": "lastRite",
            "лифэн": "lifeng",
            "вулфгард": "wulfgard",
            "ксайхи": "xaihi",
            "ксаихи": "xaihi",
            "тангтанг": "tangtang",
            "росси": "rossi",
            "чжуань фаньи": "zhuangfy",
            "ми фу": "mifu"
        };

        if (ruMapping[nameLower]) {
            return ruMapping[nameLower];
        }

        return char.charData?.id || char.id || "";
    }

    function mapProfessionToClass(key) {
        if (!key) return "guard";
        return key.replace("profession_", "");
    }

    function mapPropertyToElement(key) {
        if (!key) return null;
        return key.replace("char_property_", "");
    }

    function getOperatorData(char) {
        const svelteId = getSvelteCharId(char);
        const staticData = charactersById[svelteId];
        if (staticData) {
            return staticData;
        }

        return {
            id: char.charData?.avatarSqUrl || svelteId || char.id,
            name: char.charData?.name || char.name || "Operator",
            rarity: Number(char.charData?.rarity?.value || char.rarity || 4),
            class: mapProfessionToClass(char.charData?.profession?.key) || "guard",
            element: mapPropertyToElement(char.charData?.property?.key) || null
        };
    }

    $: if (username) {
        loadProfile(username);
    }

    async function loadProfile(name) {
        loading = true;
        errorMsg = "";
        try {
            const data = await getUserProfileByName(name);
            if (!data) {
                errorMsg = "Profile not found";
                profile = null;
            } else {
                profile = data;
                // Parse details
                if (profile.details) {
                    profile.details = profile.details.map(d => {
                        let parsedInfo = {};
                        try {
                            parsedInfo = typeof d.account_info === "string" ? JSON.parse(d.account_info) : d.account_info;
                        } catch (e) {
                            console.error("Failed to parse detail account_info:", e);
                        }
                        return {
                            ...d,
                            info: parsedInfo
                        };
                    });
                    if (profile.details.length > 0) {
                        selectedGameUid = profile.details[0].game_uid;
                    }
                }
            }
        } catch (e) {
            errorMsg = e.message || "Failed to load profile";
        } finally {
            loading = false;
        }
    }

    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || profile?.details?.[0];

    function getServerLabel(serverId) {
        return serverId === "2" ? "Asia" : "Americas / Europe";
    }

    function getAvatarUrl(pictureId) {
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }
</script>

<svelte:head>
    <title>{username ? `${username} - Profile | Goyfield` : 'Player Profile | Goyfield'}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 select-text">
    {#if loading}
        <div class="flex items-center justify-center min-h-[50vh]">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFE145]"></div>
        </div>
    {:else if errorMsg}
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md backdrop-blur-md shadow-2xl">
                <Icon name="warning" class="w-16 h-16 text-red-500 mb-4 mx-auto" />
                <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-2 font-sdk">
                    {errorMsg === "Profile not found" ? "Профиль не найден" : "Профиль скрыт"}
                </h3>
                <p class="text-sm dark:text-gray-400 text-gray-600 font-mono">
                    {errorMsg === "Profile not found" 
                        ? `Пользователь с именем "${username}" не зарегистрирован.` 
                        : "Этот пользователь скрыл свои данные в настройках приватности."}
                </p>
                <a href="/leaderboard" class="mt-6 inline-block px-6 py-2.5 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 font-bold rounded-lg transition-colors font-sdk text-sm">
                    Вернуться к лидерборду
                </a>
            </div>
        </div>
    {:else if profile}
        <!-- Read-Only Profile view -->
        <div class="space-y-6" in:fade>
            <!-- Top Header user card -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <!-- Read-Only Avatar -->
                    <div class="shrink-0">
                        {#if getAvatarUrl(profile.picture)}
                            <img
                                src={getAvatarUrl(profile.picture)}
                                alt="User Avatar"
                                class="w-20 h-20 rounded-xl border-2 border-white/20 object-cover"
                            />
                        {:else}
                            <div class="w-20 h-20 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white/50 text-2xl font-bold">
                                {profile.name ? profile.name[0].toUpperCase() : "?"}
                            </div>
                        {/if}
                    </div>

                    <!-- Display Name -->
                    <div class="flex flex-col gap-1">
                        <h1 class="text-2xl font-bold dark:text-white text-gray-900 font-sdk">
                            {profile.name}
                        </h1>
                    </div>
                </div>

                <!-- Game account cards inside header -->
                <div class="flex flex-wrap items-center gap-4">
                    {#if profile.details && profile.details.length > 0}
                        {#each profile.details as d}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="bg-white/5 border text-left p-3 rounded-xl flex items-center gap-4 w-60 hover:bg-white/10 transition-all cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-[#FFE145]' : 'border-white/10'}"
                            >
                                <img
                                    src={d.info?.base?.avatarUrl || (d.info?.chars?.[0]?.charData?.avatarSqUrl) || "/images/operators/icons/endministrator1.png"}
                                    alt="Roster Leader"
                                    class="w-10 h-10 rounded bg-white/10 border border-white/20 object-cover"
                                    on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                />
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between font-mono">
                                        <span class="text-sm font-bold text-white truncate">{d.info?.base?.name || "Operator"}</span>
                                        <span class="text-xs text-[#FFE145] font-black">{d.info?.base?.level || 1}级</span>
                                    </div>
                                    <div class="text-[10px] text-gray-400 font-mono truncate">UID: {d.game_uid}</div>
                                    <div class="text-[9px] text-gray-500 font-mono truncate">{getServerLabel(d.info?.base?.serverId)}</div>
                                </div>
                                <div class="bg-[#FFE145]/10 border border-[#FFE145]/30 text-[#FFE145] rounded-lg w-10 h-10 flex items-center justify-center font-sdk font-bold text-lg">
                                    {d.info?.contract?.level || "-"}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Profile Content Grid (3 Columns) -->
            {#if activeAccount}
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6" in:fade>
                    
                    <!-- COLUMN 1: Overview and Gacha statistics -->
                    <div class="space-y-6">
                        <!-- Overview Card -->
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                            <h2 class="text-xl font-bold dark:text-white text-gray-900 mb-6 font-sdk border-b border-white/10 pb-3">
                                {$t("profile.overview")}
                            </h2>
                            <div class="space-y-4 font-mono text-sm">
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.operators_count")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.charCount || 0} / {Object.keys(charactersById).length}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.exploration_level")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.explorationLevel || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.weapons")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.weaponCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.files")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.fileCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.awake_day")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.awakeDay || "-"}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.sanity")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.sanity || 0} / {activeAccount.info?.stats?.maxSanity || 358}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.protopass")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.protoPass || 0} / {activeAccount.info?.stats?.protoPassMax || 60}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.weekly_routine")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.weeklyRoutine || 0} / {activeAccount.info?.stats?.weeklyRoutineMax || 10}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-white/5">
                                    <span class="text-gray-400">{$t("profile.activity_points")}</span>
                                    <span class="text-white font-bold">{activeAccount.info?.stats?.activityPoints || 0} / {activeAccount.info?.stats?.activityPointsMax || 100}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Statistics Mock Card -->
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                            <h2 class="text-xl font-bold dark:text-white text-gray-900 mb-4 font-sdk border-b border-white/10 pb-3">
                                {$t("profile.stats")}
                            </h2>
                            <div class="h-40 flex items-center justify-center border border-white/10 rounded-xl bg-white/5 font-mono text-xs text-gray-500">
                                Global Rank Percentile: Top 5.2%
                            </div>
                        </div>
                    </div>

                    <!-- COLUMN 2: Crisis Contract details -->
                    <div>
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl h-full flex flex-col">
                            <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                <h2 class="text-xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {$t("profile.crisis_contract")}
                                </h2>
                                <span class="bg-[#FFE145]/15 border border-[#FFE145]/40 text-[#FFE145] font-black font-sdk px-3 py-1.5 rounded-lg text-lg">
                                    Level {activeAccount.info?.contract?.level || "-"}
                                </span>
                            </div>

                            {#if activeAccount.info?.contract}
                                <div class="text-sm font-mono text-gray-400 mb-6">
                                    {$t("profile.clear_time_label")} 
                                    <span class="text-white font-bold text-lg ml-1">
                                        {activeAccount.info.contract.clearTime} сек.
                                    </span>
                                </div>

                                <!-- Operator slots used for contract clear -->
                                <div class="grid grid-cols-2 gap-4 flex-1">
                                    {#each activeAccount.info.contract.chars as char}
                                        {@const opData = getOperatorData(char)}
                                        <div class="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                            <img
                                                src={opData.id.startsWith('http') ? opData.id : `/images/operators/icons/${opData.id}.png`}
                                                alt={opData.name}
                                                class="w-14 h-14 rounded-lg bg-white/10 border border-white/20 object-cover"
                                                on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                            />
                                            <div class="min-w-0 flex-1">
                                                <div class="text-xs font-bold text-white truncate font-mono">{opData.name}</div>
                                                <div class="text-[10px] text-gray-400 font-mono mt-1">Level {char.level}</div>
                                                <div class="flex items-center gap-1 mt-1 text-[9px] text-[#FFE145] font-black">
                                                    {#each Array(char.potential || 1) as _}
                                                        ★
                                                    {/each}
                                                </div>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div class="flex-1 flex flex-col items-center justify-center text-center text-gray-500 font-mono text-sm py-12">
                                    No Contingency Contract records.
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- COLUMN 3: Operator Grid -->
                    <div>
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl h-full flex flex-col">
                            <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                <h2 class="text-xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {$t("profile.operators_title")}
                                </h2>
                            </div>

                            <div class="grid grid-cols-[repeat(auto-fill,120px)] gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1 justify-center">
                                {#each activeAccount.info?.chars || [] as char}
                                    {@const opData = getOperatorData(char)}
                                    <OperatorCard
                                        operator={opData}
                                        level={char.level}
                                        potential={(char.potential || 1) - 1}
                                        owned={true}
                                    />
                                {/each}
                            </div>
                        </div>
                    </div>

                </div>
            {:else}
                <div class="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md text-gray-500 font-mono text-sm leading-relaxed" in:fade>
                    No connected game accounts.
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
