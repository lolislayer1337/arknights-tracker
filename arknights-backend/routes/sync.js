const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseIdToken } = require('../authHelper');
const { checkNsfw, saveWebpImage } = require('../imageHelper');
const axios = require('axios');
const crypto = require('crypto');
const leaderboardRouter = require('./leaderboard');

const router = express.Router();
const prisma = new PrismaClient();

function generateSign(path, query, timestamp, token) {
    const headerCa = JSON.stringify({ platform: "3", timestamp: timestamp, dId: "", vName: "1.0.0" });
    const strToSign = `${path}${query}${timestamp}${headerCa}`;
    const hmacSha256 = crypto.createHmac('sha256', token)
                             .update(strToSign)
                             .digest('hex');
    return crypto.createHash('md5')
                 .update(hmacSha256)
                 .digest('hex');
}

router.post('/profile', async (req, res) => {
    const { idToken, name, picture, is_private } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const updateData = {
            updated_at: new Date()
        };
        if (name !== undefined) updateData.name = name;
        if (is_private !== undefined) updateData.is_private = Number(is_private);
        if (picture !== undefined) updateData.picture = picture;

        const userAccount = await prisma.userAccount.upsert({
            where: { firebase_uid: firebaseUid },
            update: updateData,
            create: {
                firebase_uid: firebaseUid,
                name: name || payload.name || "Operator",
                picture: picture || null,
                is_private: is_private !== undefined ? Number(is_private) : 0
            }
        });

        if (is_private !== undefined) {
            leaderboardRouter.clearCache();
        }

        res.json({ status: 'success', data: userAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.get('/profile/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: uid },
            include: { details: true }
        });

        if (!userAccount) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ status: 'success', data: userAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/sync', async (req, res) => {
    const { idToken, gameToken, testRecords } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });
        if (!userAccount) {
            return res.status(400).json({ error: "Profile not registered. Please register a profile first." });
        }

        const SYNC_COOLDOWN = 7 * 60 * 1000;
        const now = Date.now();
        const lastUpdated = new Date(userAccount.updated_at).getTime();
        
        if (false && !testRecords && (now - lastUpdated < SYNC_COOLDOWN)) {
            const timeRemaining = Math.ceil((SYNC_COOLDOWN - (now - lastUpdated)) / 1000 / 60);
            return res.status(429).json({ 
                error: `Sync is on cooldown. Please wait ${timeRemaining} minutes before trying again.` 
            });
        }

        let syncedAccounts = [];

        if (testRecords) {
            syncedAccounts = testRecords;
        } else {
            let tokenToUse = gameToken.trim();
            if (tokenToUse.startsWith('{') && tokenToUse.endsWith('}')) {
                try {
                    const parsed = JSON.parse(tokenToUse);
                    if (parsed.data && parsed.data.content) {
                        tokenToUse = parsed.data.content.trim();
                    } else if (parsed.content) {
                        tokenToUse = parsed.content.trim();
                    }
                } catch (err) {
                    console.error("[Sync API Token Parse Warning]: Failed to parse token as JSON:", err.message);
                }
            }

            const grantRes = await axios.post(
                "https://as.gryphline.com/user/oauth2/v2/grant",
                { token: tokenToUse, appCode: "6eb76d4e13aa36e6", type: 0 },
                { headers: { "Content-Type": "application/json" } }
            );

            if (grantRes.data.status !== 0) {
                console.error("[Sync API Grant Error]: Failed to fetch grant code from Gryphline API. Response data:", grantRes.data);
                return res.status(400).json({ error: "Invalid or expired game token." });
            }

            const credRes = await axios.post(
                "https://zonai.skport.com/api/v1/user/auth/generate_cred_by_code",
                { kind: 1, code: grantRes.data.data.code },
                { headers: { "Content-Type": "application/json" } }
            );

            const { cred, token } = credRes.data.data;
            const ts = String(Math.floor(Date.now() / 1000));
            const bindPath = "/api/v1/game/player/binding";
            const sign = generateSign(bindPath, "", ts, token);

            const bindRes = await axios.get(
                `https://zonai.skport.com${bindPath}`,
                {
                    headers: {
                        "Accept": "application/json", "cred": cred, "sign": sign,
                        "platform": "3", "timestamp": ts, "vname": "1.0.0", "dId": "",
                        "sk-language": "ru_RU",
                        "User-Agent": "Mozilla/5.0"
                    }
                }
            );

            console.log("[Sync API Bindings Received]:", JSON.stringify(bindRes.data, null, 2));

            if (bindRes.data.code !== 0) {
                console.error("[Sync API Binding Error]: Failed to fetch binding list. Response data:", bindRes.data);
                return res.status(400).json({ error: `Game binding query failed: ${bindRes.data.msg}` });
            }

            const gamesList = bindRes.data.data?.list || [];
            const accountsToTry = [];
            
            for (const game of gamesList) {
                for (const acc of (game.bindingList || [])) {
                    const roles = acc.roles || [];
                    if (roles.length > 0) {
                        for (const role of roles) {
                            accountsToTry.push({
                                role_id: String(role.roleId),
                                server_id: String(role.serverId || role.channelMasterId || '3'),
                                game_name: game.appName || 'Unknown'
                            });
                        }
                    } else {
                        accountsToTry.push({
                            role_id: String(acc.uid),
                            server_id: '3',
                            game_name: game.appName || 'Unknown'
                        });
                    }
                }
            }

            for (const acc of accountsToTry) {
                const ts = String(Math.floor(Date.now() / 1000));
                const rosPath = "/api/v1/game/endfield/card/detail";
                const query = `roleId=${acc.role_id}&serverId=${acc.server_id}`;
                
                const rosHeaders = {
                    "Accept": "application/json", "cred": cred,
                    "sign": generateSign(rosPath, query, ts, token),
                    "platform": "3", "timestamp": ts, "vname": "1.0.0", "sk-language": "ru_RU",
                    "User-Agent": "Mozilla/5.0"
                };

                const rosRes = await axios.get(
                    `https://zonai.skport.com${rosPath}?${query}`,
                    { headers: rosHeaders }
                );

                console.log("[Sync API Detail for UID ...]:", JSON.stringify(rosRes.data, null, 2));

                if (rosRes.data.code === 0) {
                    const detail = rosRes.data.data;
                    
                    let contractDetail = null;
                    const realDetail = detail.detail || detail;
                    const contractId = realDetail.crisisContract?.[0]?.id;
                    if (contractId) {
                        const ccPath = "/api/v1/game/endfield/card/crisis-contract";
                        const ccQuery = `roleId=${acc.role_id}&serverId=${acc.server_id}&userId=&contractId=${contractId}`;
                        const ccHeaders = {
                            "Accept": "application/json", "cred": cred,
                            "sign": generateSign(ccPath, ccQuery, ts, token),
                            "platform": "3", "timestamp": ts, "vname": "1.0.0", "sk-language": "ru_RU",
                            "User-Agent": "Mozilla/5.0"
                        };
                        try {
                            const ccRes = await axios.get(
                                `https://zonai.skport.com${ccPath}?${ccQuery}`,
                                { headers: ccHeaders }
                            );
                            if (ccRes.data.code === 0) {
                                contractDetail = ccRes.data.data?.crisisContract;
                                console.log("[Sync API Crisis Contract Detailed Info Loaded]:", JSON.stringify(contractDetail, null, 2));
                            }
                        } catch (err) {
                            console.error("[Sync API Crisis Contract Fetch Error]:", err.message);
                        }
                    }

                    syncedAccounts.push({
                        game_uid: acc.role_id,
                        server_id: acc.server_id,
                        account_info: detail,
                        contract_detail: contractDetail
                    });
                } else {
                    console.error(`[Sync API Detail Error]: Failed to fetch card details for UID ${acc.role_id}. Response data:`, rosRes.data);
                }
            }
        }

        if (syncedAccounts.length === 0) {
            console.error("[Sync API Sync Error]: No accounts were successfully synced or fetched.");
            return res.status(400).json({ error: "No game accounts found or failed to fetch their details." });
        }

        for (const synced of syncedAccounts) {
            const existingDetail = await prisma.userAccountDetails.findUnique({
                where: { game_uid: synced.game_uid },
                include: { user: true }
            });

            if (existingDetail && existingDetail.user.firebase_uid !== firebaseUid) {
                return res.status(403).json({ 
                    error: `Game UID ${synced.game_uid} is already linked to another user account.` 
                });
            }

            const normalizedInfo = normalizeGameAccountInfo(synced.account_info, synced.server_id, synced.contract_detail);
            const detailRecord = await prisma.userAccountDetails.upsert({
                where: { game_uid: synced.game_uid },
                update: {
                    account_info: JSON.stringify(normalizedInfo)
                },
                create: {
                    user_id: userAccount.id,
                    game_uid: synced.game_uid,
                    account_info: JSON.stringify(normalizedInfo)
                }
            });

            const detailsJson = normalizedInfo;
            
            let clearTime = null;
            let leaderboardInfo = {};
            let eventType = "contract";

            if (detailsJson.contract || (detailsJson.detail && detailsJson.detail.contract)) {
                const c = detailsJson.contract || detailsJson.detail.contract;
                clearTime = parseFloat(c.clearTime || c.costTime || c.time);
                leaderboardInfo = c;
            } else if (detailsJson.clearTime) {
                clearTime = parseFloat(detailsJson.clearTime);
                leaderboardInfo = detailsJson.leaderboardInfo || {};
                eventType = detailsJson.eventType || "contract";
            }

            if (clearTime !== null && !isNaN(clearTime) && clearTime > 0) {
                const existingLeaderboard = await prisma.userLeaderboard.findFirst({
                    where: {
                        game_uid: synced.game_uid,
                        event_type: eventType
                    }
                });

                if (existingLeaderboard) {
                    await prisma.userLeaderboard.update({
                        where: { id: existingLeaderboard.id },
                        data: {
                            clear_time: clearTime,
                            leaderboard_info: JSON.stringify(leaderboardInfo)
                        }
                    });
                } else {
                    await prisma.userLeaderboard.create({
                        data: {
                            game_uid: synced.game_uid,
                            event_type: eventType,
                            clear_time: clearTime,
                            leaderboard_info: JSON.stringify(leaderboardInfo)
                        }
                    });
                }
            }
        }

        await prisma.userAccount.update({
            where: { id: userAccount.id },
            data: { updated_at: new Date() }
        });

        const allDetails = await prisma.userAccountDetails.findMany({
            where: { user_id: userAccount.id }
        });

        res.json({
            status: 'success',
            game_accounts: allDetails.map(d => ({
                game_uid: d.game_uid,
                account_info: JSON.parse(d.account_info)
            }))
        });

    } catch (e) {
        console.error("[Sync API Error]:", e.message);
        if (e.response) {
            console.error("[Sync API Axios Response Error]: Status:", e.response.status, "Data:", JSON.stringify(e.response.data));
        } else if (e.request) {
            console.error("[Sync API Axios Request Error]: No response received from target server.");
        }
        res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
});

router.post('/upload-avatar', async (req, res) => {
    const { idToken, image, filename } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });

        if (!userAccount) {
            return res.status(400).json({ error: "Profile not found. Register first." });
        }

        const now = new Date();
        const resetDate = new Date(userAccount.last_upload_reset);
        let uploadCount = userAccount.upload_count;
        let mustReset = false;

        if (now.getFullYear() !== resetDate.getFullYear() || now.getMonth() !== resetDate.getMonth()) {
            uploadCount = 0;
            mustReset = true;
        }

        if (uploadCount >= 10) {
            return res.status(429).json({ error: "Monthly upload limit reached (max 10 uploads per month)." });
        }

        const isNsfw = await checkNsfw(image, filename || '');
        if (isNsfw) {
            await prisma.userAccount.update({
                where: { id: userAccount.id },
                data: {
                    avatar_strike: 1,
                    upload_count: uploadCount + 1,
                    last_upload_reset: mustReset ? now : resetDate
                }
            });

            return res.json({
                status: 'success',
                nsfw: true,
                avatar_strike: 1,
                message: "Image rejected due to content policy. Image is preserved in local browser cache only."
            });
        }

        const fileId = await saveWebpImage(image);

        const updated = await prisma.userAccount.update({
            where: { id: userAccount.id },
            data: {
                picture: fileId,
                upload_count: uploadCount + 1,
                last_upload_reset: mustReset ? now : resetDate,
                avatar_strike: 0
            }
        });

        res.json({
            status: 'success',
            nsfw: false,
            picture: fileId,
            data: updated
        });

    } catch (e) {
        console.error("[Upload API Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.delete('/game-account/:game_uid', async (req, res) => {
    const { game_uid } = req.params;
    const { idToken } = req.body;
    try {
        const payload = await verifyFirebaseIdToken(idToken);
        const firebaseUid = payload.sub;

        const userAccount = await prisma.userAccount.findUnique({
            where: { firebase_uid: firebaseUid }
        });
        if (!userAccount) {
            return res.status(400).json({ error: "Profile not found." });
        }

        const existingDetail = await prisma.userAccountDetails.findUnique({
            where: { game_uid: game_uid }
        });
        if (!existingDetail) {
            return res.status(404).json({ error: "Game account not found." });
        }

        if (existingDetail.user_id !== userAccount.id) {
            return res.status(403).json({ error: "You do not own this game account." });
        }

        await prisma.userAccountDetails.delete({
            where: { game_uid: game_uid }
        });

        leaderboardRouter.clearCache();

        res.json({ status: 'success', message: "Game account successfully unlinked." });
    } catch (e) {
        console.error("[Delete Game Account Error]:", e.message);
        res.status(400).json({ error: e.message });
    }
});

router.get('/profile-by-name/:name', async (req, res) => {
    const { name } = req.params;
    try {
        let userAccount = await prisma.userAccount.findFirst({
            where: { name: name },
            include: { details: true }
        });

        if (!userAccount) {
            const allMatches = await prisma.userAccount.findMany({
                where: {
                    name: {
                        startsWith: name
                    }
                },
                include: { details: true }
            });
            userAccount = allMatches.find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
        }

        if (!userAccount) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        if (userAccount.is_private === 1) {
            return res.status(403).json({ error: 'This profile is private' });
        }

        res.json({ status: 'success', data: userAccount });
    } catch (e) {
        console.error("[Profile API Error]:", e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function normalizeGameAccountInfo(rawInfo, serverId, contractDetail) {
    if (rawInfo && rawInfo.base && rawInfo.stats && !contractDetail) {
        return rawInfo;
    }
    const detail = rawInfo.detail || rawInfo;
    const base = detail.base || {};
    const dungeon = detail.dungeon || {};
    const bpSystem = detail.bpSystem || {};
    const dailyMission = detail.dailyMission || {};
    const weeklyMission = detail.weeklyMission || {};
    const crisisContractList = detail.crisisContract || [];

    let awakeDay = 0;
    if (base.saveTime && base.createTime) {
        const diffSeconds = Number(base.saveTime) - Number(base.createTime);
        awakeDay = Math.max(1, Math.floor(diffSeconds / 86400));
    }

    let contractLevel = 0;
    let contractClearTime = 0;
    let contractChars = [];

    if (contractDetail) {
        contractLevel = contractDetail.status?.highest || 0;
        const bestRecord = contractDetail.history?.bestRecord;
        if (bestRecord && bestRecord.isPass) {
            contractClearTime = parseFloat(bestRecord.passTs) || 0;
            contractChars = (bestRecord.chars || []).map(c => ({
                id: c.charId,
                name: c.name || "Operator",
                level: c.level || 1,
                potentialLevel: c.potentialLevel || 0,
                potential: c.potentialLevel + 1,
                charData: {
                    id: c.charId,
                    name: c.name || "Operator",
                    avatarSqUrl: c.avatarUrl
                }
            }));
        }
    } else if (crisisContractList.length > 0) {
        const latestContract = crisisContractList[0];
        contractLevel = latestContract.highest || 0;
        contractClearTime = latestContract.clearTime || latestContract.costTime || latestContract.time || 0;
        contractChars = latestContract.chars || [];
    }

    const mappedChars = (detail.chars || []).map(c => {
        return {
            id: c.charData?.id || c.id,
            name: c.charData?.name || c.name || "Operator",
            level: c.level || 1,
            potentialLevel: c.potentialLevel || 0,
            potential: (c.potentialLevel !== undefined ? c.potentialLevel + 1 : (c.potential || 1)),
            charData: c.charData
        };
    });

    const normalized = {
        base: {
            name: base.name || "Operator",
            level: base.level || 1,
            serverId: String(serverId || base.serverId || '3'),
            avatarUrl: base.avatarUrl || ""
        },
        stats: {
            charCount: base.charNum || mappedChars.length || 0,
            explorationLevel: base.worldLevel || 0,
            weaponCount: base.weaponNum || 0,
            fileCount: base.docNum || 0,
            awakeDay: awakeDay,
            sanity: Number(dungeon.curStamina || 0),
            maxSanity: Number(dungeon.maxStamina || 130),
            protoPass: Number(bpSystem.curLevel || 0),
            protoPassMax: Number(bpSystem.maxLevel || 60),
            weeklyRoutine: Number(weeklyMission.score || 0),
            weeklyRoutineMax: Number(weeklyMission.total || 10),
            activityPoints: Number(dailyMission.dailyActivation || 0),
            activityPointsMax: Number(dailyMission.maxDailyActivation || 100)
        },
        contract: {
            level: contractLevel,
            clearTime: contractClearTime,
            chars: contractChars
        },
        chars: mappedChars,
        detail: detail
    };

    return normalized;
}

module.exports = router;
