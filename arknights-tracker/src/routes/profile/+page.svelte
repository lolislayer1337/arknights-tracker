<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";
    import { user, login, logout } from "$lib/stores/cloudStore.js";
    import { getUserProfile, registerProfile, syncGameAccount, uploadAvatar, deleteGameAccount } from "$lib/api.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { fade, fly } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import { characters } from "$lib/data/characters.js";

    let profile = null;
    let loading = true;
    let needsRegistration = false;
    let syncModalOpen = false;
    let settingsModalOpen = false;
    let gameTokenInput = "";
    let isEditingName = false;
    let newProfileName = "";
    let syncing = false;
    let avatarInput;
    let isPrivate = false;

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

    $: if (profile) {
        isPrivate = profile.is_private === 1;
    }

    async function handleTogglePrivate() {
        try {
            const token = await $user.getIdToken();
            const nextPrivateVal = isPrivate ? 0 : 1;
            const data = await registerProfile(token, profile.name, profile.picture, nextPrivateVal);
            profile.is_private = data.is_private;
            isPrivate = data.is_private === 1;
            addNotification("success", "Privacy settings updated!");
        } catch (e) {
            addNotification("error", e.message);
        }
    }

    // Active selected game account UID
    let selectedGameUid = null;
    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || profile?.details?.[0];

    // Local avatar cache for NSFW items
    let localAvatar = "";

    onMount(async () => {
        if (typeof window !== 'undefined') {
            localAvatar = localStorage.getItem("goyfield_local_avatar") || "";
        }
        
        user.subscribe(async (u) => {
            if (u) {
                loading = true;
                const data = await getUserProfile(u.uid);
                if (data) {
                    profile = data;
                    // Parse details
                    if (profile.details) {
                        profile.details = profile.details.map(d => {
                            try {
                                return { ...d, info: JSON.parse(d.account_info) };
                            } catch (e) {
                                return { ...d, info: {} };
                            }
                        });
                        if (profile.details.length > 0) {
                            selectedGameUid = profile.details[0].game_uid;
                        }
                    }
                    newProfileName = profile.name || "";
                    needsRegistration = false;
                } else {
                    needsRegistration = true;
                }
                loading = false;
            } else {
                profile = null;
                needsRegistration = false;
                loading = false;
            }
        });
    });

    async function handleGoogleLogin() {
        try {
            await login();
        } catch (e) {
            addNotification("error", "Login failed");
        }
    }

    async function handleRegister() {
        if (!newProfileName.trim()) {
            addNotification("error", "Username cannot be empty");
            return;
        }
        try {
            loading = true;
            const token = await $user.getIdToken();
            const data = await registerProfile(token, newProfileName.trim(), localAvatar || null);
            profile = { ...data, details: [] };
            needsRegistration = false;
            addNotification("success", "Profile created successfully!");
        } catch (e) {
            addNotification("error", e.message);
        } finally {
            loading = false;
        }
    }

    async function handleUpdateName() {
        if (!newProfileName.trim()) return;
        if (newProfileName.trim() === profile.name) {
            isEditingName = false;
            return;
        }
        try {
            const token = await $user.getIdToken();
            const data = await registerProfile(token, newProfileName.trim(), profile.picture);
            profile.name = data.name;
            isEditingName = false;
            addNotification("success", "Username updated!");
        } catch (e) {
            addNotification("error", e.message);
        }
    }

    // Client-side WebP conversion
    function processAndUploadImage(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = async function () {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 150;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                // Center crop to square
                const minSide = Math.min(width, height);
                const sx = (width - minSide) / 2;
                const sy = (height - minSide) / 2;

                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, MAX_WIDTH, MAX_HEIGHT);

                // Convert to WebP format
                const webpBase64 = canvas.toDataURL("image/webp", 0.85);

                // Double check size
                const sizeInBytes = Math.round((webpBase64.length * 3) / 4);
                if (sizeInBytes > 1024 * 1024) {
                    addNotification("error", "Converted WebP exceeds 1MB limit.");
                    return;
                }

                try {
                    loading = true;
                    const token = await $user.getIdToken();
                    const uploadResult = await uploadAvatar(token, webpBase64, file.name);

                    if (uploadResult.nsfw) {
                        // Image flagged NSFW: Save locally only
                        localAvatar = webpBase64;
                        localStorage.setItem("goyfield_local_avatar", webpBase64);
                        if (profile) {
                            profile.picture = null;
                            profile.avatar_strike = 1;
                        }
                        addNotification("warning", $t("profile.strike_warning"));
                    } else {
                        // Saved clean avatar
                        localAvatar = "";
                        localStorage.removeItem("goyfield_local_avatar");
                        if (profile) {
                            profile.picture = uploadResult.picture;
                            profile.avatar_strike = 0;
                        }
                        addNotification("success", "Avatar updated successfully!");
                    }
                } catch (err) {
                    addNotification("error", err.message);
                } finally {
                    loading = false;
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            processAndUploadImage(file);
        }
    }

    async function handleSyncGame() {
        if (!gameTokenInput.trim()) {
            addNotification("error", "Game Token cannot be empty");
            return;
        }
        try {
            syncing = true;
            const token = await $user.getIdToken();
            const accounts = await syncGameAccount(token, gameTokenInput.trim());
            
            profile.details = accounts.map(d => ({
                ...d,
                info: d.account_info // syncGameAccount returns pre-parsed or nested objects
            }));

            if (profile.details.length > 0) {
                selectedGameUid = profile.details[0].game_uid;
            }

            syncModalOpen = false;
            gameTokenInput = "";
            addNotification("success", "Game account synced successfully!");
        } catch (e) {
            addNotification("error", e.message);
        } finally {
            syncing = false;
        }
    }

    async function handleDeleteAccount(gameUid) {
        if (!confirm($t("profile.confirm_unlink"))) {
            return;
        }
        try {
            const token = await $user.getIdToken();
            await deleteGameAccount(token, gameUid);
            profile.details = profile.details.filter(d => d.game_uid !== gameUid);
            if (selectedGameUid === gameUid) {
                selectedGameUid = profile.details.length > 0 ? profile.details[0].game_uid : null;
            }
            addNotification("success", $t("profile.unlink_success"));
        } catch (e) {
            addNotification("error", e.message);
        }
    }

    // Mock simulation removed - production sync enabled

    function getServerLabel(serverId) {
        return serverId === "2" ? "Asia" : "Americas / Europe";
    }

    function getAvatarUrl(pictureId) {
        if (localAvatar) return localAvatar;
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }
</script>

<div class="max-w-[1600px] w-full mx-auto pb-20">
    {#if loading}
        <div class="flex items-center justify-center min-h-[60vh]">
            <Icon name="loading" class="w-12 h-12 text-[#FFE145] animate-spin" />
        </div>
    {:else if !$user}
        <!-- Image 1: Google login integration screen -->
        <div class="flex items-center justify-center min-h-[70vh]" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-lg text-center backdrop-blur-md shadow-2xl flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-4 font-sdk">
                    {$t("profile.sync_title")}
                </h2>
                <p class="text-sm dark:text-gray-400 text-gray-600 mb-6 leading-relaxed">
                    {$t("profile.register_subtitle")}
                </p>
                <button
                    on:click={handleGoogleLogin}
                    class="flex items-center gap-3 px-6 py-3 border border-gray-300 dark:border-[#444444] dark:bg-[#424242] dark:text-[#E4E4E4] rounded-lg hover:bg-gray-100 transition-all font-bold text-gray-700 bg-white"
                >
                    <Icon name="google" class="w-5 h-5" />
                    {$t("profile.sync_btn")}
                </button>
            </div>
        </div>
    {:else if needsRegistration}
        <!-- Image 2: Registration setup screen -->
        <div class="flex items-center justify-center min-h-[70vh]" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-md shadow-2xl flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
                    {$t("profile.register_title")}
                </h2>
                
                <!-- Avatar selection button -->
                <div class="relative group cursor-pointer mb-6" on:click={() => avatarInput.click()}>
                    {#if localAvatar}
                        <img src={localAvatar} alt="Local Avatar" class="w-28 h-28 rounded-xl border-2 border-[#FFE145] object-cover" />
                    {:else}
                        <div class="w-28 h-28 rounded-xl bg-white/10 border-2 border-white/20 hover:border-[#FFE145] transition-colors flex items-center justify-center text-white/50">
                            <span class="text-4xl">+</span>
                        </div>
                    {/if}
                    <input type="file" accept="image/*" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />
                </div>

                <div class="w-full mb-6">
                    <label class="block text-xs uppercase tracking-wider dark:text-gray-400 text-gray-600 font-bold mb-2" for="reg-username">
                        {$t("profile.register_name")}
                    </label>
                    <input
                        id="reg-username"
                        type="text"
                        bind:value={newProfileName}
                        placeholder="e.g. ivawa"
                        class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-[#FFE145] transition-colors font-mono"
                    />
                </div>

                <button
                    on:click={handleRegister}
                    class="w-full py-3 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 font-bold rounded-lg transition-colors font-sdk"
                >
                    {$t("profile.register_btn")}
                </button>
            </div>
        </div>
    {:else if profile}
        <!-- Image 3: Full Profile view -->
        <div class="space-y-6" in:fade>
            
            <!-- Top Header user card -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <!-- Clickable Avatar -->
                    <div class="relative group cursor-pointer shrink-0" on:click={() => avatarInput.click()}>
                        {#if getAvatarUrl(profile.picture) || localAvatar}
                            <img
                                src={getAvatarUrl(profile.picture)}
                                alt="User Avatar"
                                class="w-20 h-20 rounded-xl border-2 border-white/20 group-hover:border-[#FFE145] transition-colors object-cover"
                            />
                        {:else}
                            <div class="w-20 h-20 rounded-xl bg-white/10 border-2 border-white/20 group-hover:border-[#FFE145] transition-colors flex items-center justify-center text-white/50 text-2xl font-bold">
                                {profile.name ? profile.name[0].toUpperCase() : "?"}
                            </div>
                        {/if}
                        <div class="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Icon name="pen" class="w-5 h-5 text-white" />
                        </div>
                        <input type="file" accept="image/*" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />
                    </div>

                    <!-- Editable Name -->
                    <div class="flex flex-col gap-1">
                        {#if isEditingName}
                            <div class="flex items-center gap-2">
                                <input
                                    type="text"
                                    bind:value={newProfileName}
                                    class="bg-white/10 border border-white/20 text-white rounded px-2 py-1 outline-none font-mono text-xl"
                                    on:keydown={(e) => e.key === "Enter" && handleUpdateName()}
                                />
                                <button on:click={handleUpdateName} class="p-1.5 bg-[#FFE145] rounded text-gray-900">
                                    <Icon name="check" class="w-4 h-4" />
                                </button>
                            </div>
                        {:else}
                            <div class="flex items-center gap-2">
                                <h1 class="text-2xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {profile.name}
                                </h1>
                                <button on:click={() => isEditingName = true} class="text-gray-400 hover:text-white transition-colors">
                                    <Icon name="pen" class="w-4 h-4" />
                                </button>
                            </div>
                        {/if}
                        {#if profile.avatar_strike === 1}
                            <span class="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-1">
                                <Icon name="warning" class="w-3.5 h-3.5" />
                                {$t("profile.strike_warning")}
                            </span>
                        {/if}
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
                                class="bg-white/5 border text-left p-3 rounded-xl flex items-center gap-4 w-60 hover:bg-white/10 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-[#FFE145]' : 'border-white/10'}"
                            >
                                <button
                                    on:click|stopPropagation={() => handleDeleteAccount(d.game_uid)}
                                    class="absolute -top-1.5 -right-1.5 bg-red-900/95 border border-red-500/50 hover:bg-red-600 hover:border-red-400 p-1.5 rounded-lg text-white transition-all cursor-pointer z-20 opacity-0 group-hover:opacity-100 shadow-md active:scale-95 flex items-center justify-center"
                                    title="Unlink Account"
                                >
                                    <Icon name="trash" class="w-3.5 h-3.5" />
                                </button>

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

                    <div class="flex items-center gap-2">
                        <Button variant="round" color="white" onClick={() => syncModalOpen = true}>
                            <div class="flex items-center gap-2 px-2 py-1 font-sdk">
                                <Icon name="refresh" class="w-4 h-4" />
                                <span>{$t("profile.update_btn")}</span>
                            </div>
                        </Button>
                        <button
                            on:click={() => settingsModalOpen = true}
                            class="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors text-white"
                            aria-label="Settings"
                        >
                            <Icon name="settings" class="w-5 h-5" />
                        </button>
                    </div>
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
                                <a href="/operators" class="text-xs text-[#FFE145] hover:underline font-mono">
                                    {$t("profile.more")}
                                </a>
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
                    No connected game accounts. Sync your account using the Update button above.
                </div>
            {/if}
        </div>
    {/if}

    <!-- Game Sync Modal -->
    <Modal isOpen={syncModalOpen} on:close={() => syncModalOpen = false}>
        <div class="bg-[#242424] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
            <!-- Close Button -->
            <button
                on:click={() => syncModalOpen = false}
                class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <Icon name="close" class="w-6 h-6" />
            </button>

            <h3 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
                Синхронизация с игрой
            </h3>
            
            <div class="flex flex-col gap-6 text-left mb-6 font-mono text-sm">
                <!-- Step 1 -->
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">1</div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step1")}</p>
                        <a href="https://endfield.gryphline.com/" target="_blank" rel="noopener noreferrer" class="text-xs text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://endfield.gryphline.com/
                        </a>
                    </div>
                </div>
                <!-- Step 2 -->
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">2</div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step2")}</p>
                        <a href="https://web-api.gryphline.com/cookie_store/account_token" target="_blank" rel="noopener noreferrer" class="text-xs text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://web-api.gryphline.com/cookie_store/account_token
                        </a>
                    </div>
                </div>
                <!-- Step 3 -->
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">3</div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-sdk font-bold mb-2 select-text">{$t("profile.sync_step3")}</p>
                        <input
                            type="text"
                            bind:value={gameTokenInput}
                            placeholder={'{"code":0,"data":{"content":"QqW2fmIQq...ZctQjc"},"msg":""}'}
                            class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-[#FFE145] transition-colors font-mono text-sm"
                            disabled={syncing}
                        />
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <button
                    on:click={handleSyncGame}
                    class="w-full py-3 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 font-bold rounded-lg transition-colors font-sdk flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={syncing}
                >
                    {#if syncing}
                        <Icon name="loading" class="w-5 h-5 animate-spin" />
                        <span>Updating...</span>
                    {:else}
                        <Icon name="refresh" class="w-4 h-4" />
                        <span>{$t("profile.update_btn")}</span>
                    {/if}
                </button>
            </div>
        </div>
    </Modal>

    <!-- Settings Gear Modal -->
    <Modal isOpen={settingsModalOpen} on:close={() => settingsModalOpen = false}>
        <div class="bg-[#242424] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
            <!-- Close Button -->
            <button
                on:click={() => settingsModalOpen = false}
                class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <Icon name="close" class="w-6 h-6" />
            </button>

            <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-6 font-sdk select-text">
                {$t("profile.settings_title")}
            </h3>

            <!-- Switch/Toggle for Hide account data -->
            <div class="flex items-center justify-between mb-8">
                <span class="text-sm text-gray-300 font-sdk pr-4 select-text">
                    {$t("profile.settings_hide_data")}
                </span>
                <!-- toggle switch -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    on:click={handleTogglePrivate}
                    class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0
                    {isPrivate ? 'bg-[#FFE145]' : 'bg-gray-600'}"
                >
                    <div
                        class="bg-[#1a1a1a] w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
                        {isPrivate ? 'translate-x-6' : 'translate-x-0'}"
                    ></div>
                </div>
            </div>

            <!-- Logout Button -->
            <button
                on:click={async () => {
                    await logout();
                    settingsModalOpen = false;
                    addNotification("success", "Logged out successfully!");
                }}
                class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors font-sdk"
            >
                {$t("profile.settings_logout")}
            </button>
        </div>
    </Modal>
</div>

<style>
    /* Custom thin scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 99px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
</style>
