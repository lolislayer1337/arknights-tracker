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
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { formatContractDescription } from "$lib/utils/richText.js";

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

    const charactersByApiId = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.apiId) acc[char.apiId] = char;
        return acc;
    }, {});

    function getSvelteCharId(char) {
        if (!char) return "";
        const charId = char.charData?.id || char.id || char.charId || "";

        if (charId && charactersByApiId[charId]) {
            return charactersByApiId[charId].id;
        }

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

        return charId;
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

    const weaponIdMap = {
        "wpn_sword_0012": "thermiteCutter",
        "wpn_greatsword_0010": "industry01",
        "wpn_greatsword_0006": "exemplar",
        "wpn_greatsword_0007": "formerFinery",
        "wpn_greatsword_0008": "thunderberge",
        "wpn_greatsword_0009": "sunderedPrince",
        "wpn_greatsword_0011": "quencher"
    };

    function getWeaponData(weapon) {
        if (!weapon) return null;
        const gameId = weapon.id;
        const mappedId = weaponIdMap[gameId];
        const staticData = (mappedId && weapons[mappedId]) || Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
        if (staticData) {
            return staticData;
        }
        return {
            id: gameId,
            name: weapon.name || gameId,
            rarity: Number(weapon.rarity?.value || weapon.rarity || 4),
            type: weapon.type || "sword"
        };
    }

    function getWeaponIcon(weapon) {
        if (!weapon) return "";
        const mapped = getWeaponData(weapon);
        if (mapped && mapped.id && !mapped.id.startsWith("wpn_")) {
            return getImagePath(mapped.id, "weapon-icon");
        }
        return weapon.icon || "";
    }

    function getEquipIcon(equip) {
        if (!equip) return "";
        if (equip.id) {
            return getImagePath(equip.id, "equipment");
        }
        return equip.icon || "";
    }

    let equipmentNames = {};
    $: if (typeof window !== 'undefined' && $currentLocale) {
        loadEquipmentNames($currentLocale);
    }
    async function loadEquipmentNames(lang) {
        try {
            const safeLang = (lang || "en").toLowerCase().replace("-", "");
            const mod = await import(`../../lib/locales/${safeLang}/equipment.json`);
            equipmentNames = mod.default || mod;
        } catch (e) {
            try {
                const mod = await import(`../../lib/locales/en/equipment.json`);
                equipmentNames = mod.default || mod;
            } catch (err) {}
        }
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

    function getContractTagStyle(level) {
        const lvl = Number(level) || 0;
        if (lvl >= 40) {
            return {
                border: "#D83742",
                bg: "radial-gradient(circle, rgba(255,255,255,0.12) 0.5px, transparent 0.5px) 0 0 / 3px 3px, linear-gradient(to left, #171201, #61201A)"
            };
        }
        if (lvl >= 20) {
            return {
                border: "#E97126",
                bg: "radial-gradient(circle, rgba(255,255,255,0.12) 0.5px, transparent 0.5px) 0 0 / 3px 3px, linear-gradient(to left, #131800, #694012)"
            };
        }
        return {
            border: "#828282",
            bg: "radial-gradient(circle, rgba(255,255,255,0.12) 0.5px, transparent 0.5px) 0 0 / 3px 3px, linear-gradient(to left, #050505, #313434)"
        };
    }

    function getAvatarUrl(pictureId) {
        if (localAvatar) return localAvatar;
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }
</script>

<div class="max-w-[1800px] w-full mx-auto pb-20">
    {#if loading}
        <div class="flex items-center justify-center min-h-[60vh]">
            <Icon name="loading" class="w-12 h-12 text-[#FFE145] animate-spin" />
        </div>
    {:else if !$user}
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
        <div class="flex items-center justify-center min-h-[70vh]" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-md shadow-2xl flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
                    {$t("profile.register_title")}
                </h2>
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
        <div class="space-y-6" in:fade>
            <div class="bg-white dark:bg-[#383838] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                            {@const tagStyle = getContractTagStyle(d.info?.contract?.level)}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="bg-white/5 border text-left p-3 rounded-xl flex items-center gap-4 w-[285px] hover:bg-white/10 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/5 dark:border-white/10'}"
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
                                    referrerpolicy="no-referrer"
                                    class="w-12 h-12 rounded bg-white/10 border border-white/20 object-cover shrink-0"
                                    on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                />
                                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-md font-bold dark:text-white text-gray-900 font-sdk truncate">{d.info?.base?.name || "Profile"}</span>
                                        <div class="flex items-center gap-1 border px-2 py-0.5 rounded-[3px] text-[19px] font-black text-white leading-none shrink-0 h-[24px] min-w-[62px] justify-center" 
                                             style="border-color: {tagStyle.border}; background: {tagStyle.bg};">
                                            <span>{d.info?.contract?.level || 0}</span>
                                            <Icon name="contract2" class="w-5 h-5 text-white shrink-0" />
                                        </div>
                                    </div>
                                    <div class="text-[10px] text-gray-400 font-mono truncate">UID: {d.game_uid}</div>
                                    <div class="bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans w-fit truncate">
                                        {getServerLabel(d.info?.base?.serverId)}
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center shrink-0 min-w-[36px] border-l border-white/10 pl-3">
                                    <span class="bg-gray-800 text-white dark:bg-white dark:text-black font-black text-[9px] px-1 rounded-[2px] tracking-tighter uppercase leading-none mb-0.5 select-none">Lv.</span>
                                    <span class="text-2xl font-black dark:text-white text-gray-900 font-mono leading-none">{d.info?.base?.level || 1}</span>
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

            {#if activeAccount}
                <div class="grid grid-cols-1 xl:grid-cols-[320px_435px_1fr] gap-6" in:fade>
                    
                    <div class="space-y-6">
                        <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 min-w-0 flex flex-col">
                            <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-2 font-sdk border-b border-gray-100 dark:border-[#444444] pb-3">
                                {$t("profile.overview")}
                            </h2>
                            <div class="space-y-1 px-1">
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.operators_count")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.charCount || 0} / {Object.keys(charactersById).length}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.exploration_level")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.explorationLevel || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.weapons")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.weaponCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.files")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.fileCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.awake_day")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.awakeDay || "-"}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.sanity")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.sanity || 0} / {activeAccount.info?.stats?.maxSanity || 358}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.protopass")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.protoPass || 0} / {activeAccount.info?.stats?.protoPassMax || 60}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.weekly_routine")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.weeklyRoutine || 0} / {activeAccount.info?.stats?.weeklyRoutineMax || 10}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("profile.activity_points")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.activityPoints || 0} / {activeAccount.info?.stats?.activityPointsMax || 100}</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 border border-gray-100 min-w-0 flex flex-col">
                            <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-4 font-sdk border-b border-gray-100 dark:border-[#444444] pb-3">
                                {$t("profile.stats")}
                            </h2>
                            <div class="h-40 flex items-center justify-center border border-gray-100 dark:border-[#444444] rounded-lg bg-gray-50 dark:bg-[#2e2e2e] font-mono text-xs text-gray-500 dark:text-gray-400">
                                Global Rank Percentile: Top 5.2%
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="bg-white dark:bg-[#383838] border border-white/10 rounded-2xl p-6 flex flex-col">
                            <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444444] pb-2 mb-4">
                                <div class="flex items-center gap-2">
                                    <Icon name="contract" class="w-7 h-7 text-[#21272C] dark:text-[#FDFDFD]" />
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                        {$t("profile.crisis_contract")}
                                    </h2>
                                </div>
                            </div>

                            {#if activeAccount.info?.contract && activeAccount.info.contract.level > 0}
                                {@const tagStyle = getContractTagStyle(activeAccount.info.contract.level)}
                                <div class="flex items-center justify-between mb-4">
                                    <div class="text-sm font-sdk dark:text-gray-400 text-gray-600">
                                        {$t("profile.clear_time_label")} 
                                        <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-mono">
                                            {activeAccount.info.contract.clearTime} сек.
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-1 border px-2 py-0.5 rounded-[3px] text-[19px] font-black text-white leading-none shrink-0 h-[24px] min-w-[62px] justify-center" 
                                         style="border-color: {tagStyle.border}; background: {tagStyle.bg};">
                                        <span>{activeAccount.info.contract.level || 0}</span>
                                        <Icon name="contract2" class="w-5 h-5 text-white shrink-0" />
                                    </div>
                                </div>

                                <div class="flex flex-row justify-center gap-4 flex-wrap">
                                    {#each activeAccount.info.contract.chars as char}
                                        {@const opData = getOperatorData(char)}
                                        <div class="flex flex-col border border-white/10 rounded-[4px] min-w-0 w-[84px] max-w-[84px] shrink-0 shadow-md relative">
                                            <div class="relative w-full h-[190px] bg-white/3 overflow-hidden shrink-0">
                                                <Image id={opData.id} variant="operator-preview" className="w-full h-full object-cover" />
                                                <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
                                                
                                                <div class="absolute top-1 right-1 z-30">
                                                    <PotentialIcon pot={char.potential || 1} size={32} />
                                                </div>

                                                <div class="absolute bottom-2 left-2 z-30 flex flex-col items-start leading-none select-none">
                                                    <span class="text-[8px] font-black text-white/70 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">LV</span>
                                                    <span class="text-[24px] font-black text-white leading-none tracking-tighter" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.9);">{char.level}</span>
                                                </div>
                                            </div>

                                            {#if char.weapon}
                                                {@const weaponData = getWeaponData(char.weapon)}
                                                {@const weaponName = $t(`weaponsList.${weaponData?.id}`) !== `weaponsList.${weaponData?.id}` ? $t(`weaponsList.${weaponData?.id}`) : (weaponData?.name || char.weapon.id)}
                                                <Tooltip text={weaponName}>
                                                    <div class="relative w-[96px] h-[55px] flex items-center justify-between p-1 overflow-hidden shrink-0 z-20 ml-[-12px]"
                                                         style="border: 1px solid transparent; background: linear-gradient(to right, #363634, #111111) padding-box, linear-gradient(to right, #464644, #1b1b1a) border-box;">
                                                        
                                                        <img 
                                                            src={getWeaponIcon(char.weapon)} 
                                                            alt="Weapon" 
                                                            class="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 object-contain pointer-events-none"
                                                            on:error={(e) => e.target.src = char.weapon.icon}
                                                        />
                                                        
                                                        <div class="flex flex-col justify-between h-full z-10 items-start">
                                                            <PotentialIcon pot={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel + 1 : 1} size={20} />
                                                            <div class="flex flex-col items-start leading-none">
                                                                <span class="text-[7px] text-white/50 font-black">LV</span>
                                                                <span class="text-[16px] text-white font-nums font-black leading-none" style="text-shadow: 1px 1px 0 #111;">
                                                                    {char.weapon.level}
                                                                </span>
                                                                <div class="w-6 h-[2px] bg-[#E3A000] mt-0.5 rounded"></div>
                                                            </div>
                                                        </div>

                                                        <div class="flex flex-col gap-0.5 z-10 items-end justify-center h-full pr-0.5">
                                                            {#each char.weapon.weaponTerms || [] as term}
                                                                <div class="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px]" style="background: linear-gradient(to right, #1C1C1C, #2D2D2B);">
                                                                    <div class="w-[4px] h-[10px] rounded-full transform rotate-[40deg] border-[1.5px] transition-all duration-200 outline-none shrink-0 flex items-center justify-center bg-[#FFE145] border-[#FFE145] dark:bg-[#FFE145] dark:border-[#FFE145] shadow-sm"></div>
                                                                    <span class="pl-0.5 text-[9px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            {/if}

                                            <div class="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-b-[4px]">
                                                {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                                                    {@const equip = char.equips?.[eqKey]}
                                                    {#if equip}
                                                        {@const tier = Math.max(0, (equip.enhanceStatus || 1) - 1)}
                                                        {@const eqData = equipment[equip.id]}
                                                        <Tooltip text={equipmentNames[equip.id]?.name || equip.id}>
                                                            <div class="relative flex items-center justify-end w-[38px] h-[28px] py-0.5 pl-0.5 min-w-0"
                                                                 style="border: 1px solid transparent; background: linear-gradient(to right, #101010, #1A4558) padding-box, linear-gradient(to right, #3D3F3A, #194457) border-box;">
                                                                
                                                                <div class="absolute top-0.5 left-0.5 w-[14px] h-[8px] flex items-center justify-center shrink-0">
                                                                    <svg class="w-full h-full" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <rect x="33.3789" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 33.3789 15)" fill={tier >= 1 ? "#26BAFB" : "#8F8F8F"} />
                                                                        <rect x="41.8555" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 41.8555 15)" fill={tier >= 2 ? "#26BAFB" : "#8F8F8F"} />
                                                                        <rect x="50.3281" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 50.3281 15)" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                                        <path d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                                        {#if tier >= 1}
                                                                            <path d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.6885 14.1904L23.625 10.4453L28.0068 17Z" fill="#26BAFB" />
                                                                        {/if}
                                                                        <path d="M31 0L36.1962 9H25.8038L31 0Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                                        {#if tier >= 1 && tier < 3}
                                                                            <path d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z" fill="#26BAFB" />
                                                                        {/if}
                                                                    </svg>
                                                                </div>

                                                                <img 
                                                                    src={getEquipIcon(equip)} 
                                                                    alt={eqKey} 
                                                                    class="-mr-1 w-[30px] h-[30px] object-contain pointer-events-none shrink-0"
                                                                    on:error={(e) => e.target.src = equip.icon}
                                                                />
                                                                
                                                                <div class="left-0.5 w-[14px] h-[1.5px] bg-[#E3A000] absolute bottom-0.5 rounded"></div>
                                                            </div>
                                                        </Tooltip>
                                                    {:else}
                                                        <div class="bg-[#101010]/60 border border-white/5 w-[38px] h-[28px] min-w-0"></div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </div>
                                    {/each}
                                </div>

                                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1.5 mt-4 border-t border-white/10 pt-4 justify-center">
                                    {#each activeAccount.info.contract.indicators || [] as ind}
                                        {@const tagName = $t(`contractTagNames.${ind.id}`) || ind.name}
                                        {@const tagDesc = formatContractDescription(ind.id, $t(`contractTagDesc.${ind.id}`) || ind.desc)}
                                        {@const cleanDesc = tagDesc ? tagDesc.replace(/<[^>]*>/g, "") : ""}
                                        <Tooltip text={tagName + (cleanDesc ? ": " + cleanDesc : "")}>
                                            <div class="w-12 h-12 bg-black/40 border border-white/10 rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all">
                                                <img src={getImagePath(ind.id, "contract-tag-icon")} alt={tagName} class="w-full h-full object-contain" on:error={(e) => e.target.src = ind.icon} />
                                            </div>
                                        </Tooltip>
                                    {/each}
                                </div>
                            {:else}
                                <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#333] w-full ">
                                    <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                    <p class="text-sm">
                                        {$t("emptyState.noData") || "No records found"}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="w-full">
                        <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 border border-gray-100 h-full flex flex-col w-full mx-auto">
                            <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444444] pb-3 mb-6">
                                <div class="flex gap-2">
                                    <Icon name="operators" class="w-6 h-6 text-[#21272C] dark:text-[#FDFDFD]" />
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                        {$t("profile.operators_title")}
                                    </h2>
                                </div>
                                <a href="/operators" class="text-xs text-[#FFE145] hover:underline font-mono">
                                    {$t("profile.more")}
                                </a>
                            </div>

                            <div class="grid grid-cols-[repeat(auto-fill,120px)] gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 justify-center">
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

    <Modal isOpen={syncModalOpen} on:close={() => syncModalOpen = false}>
        <div class="bg-[#242424] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
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
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">1</div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step1")}</p>
                        <a href="https://endfield.gryphline.com/" target="_blank" rel="noopener noreferrer" class="text-xs text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://endfield.gryphline.com/
                        </a>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">2</div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step2")}</p>
                        <a href="https://web-api.gryphline.com/cookie_store/account_token" target="_blank" rel="noopener noreferrer" class="text-xs text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://web-api.gryphline.com/cookie_store/account_token
                        </a>
                    </div>
                </div>
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

    <Modal isOpen={settingsModalOpen} on:close={() => settingsModalOpen = false}>
        <div class="bg-[#242424] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
            <button
                on:click={() => settingsModalOpen = false}
                class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <Icon name="close" class="w-6 h-6" />
            </button>

            <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-6 font-sdk select-text">
                {$t("profile.settings_title")}
            </h3>

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
