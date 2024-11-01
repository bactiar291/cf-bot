require('dotenv').config(); 
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

const VALID_KEY = process.env.API_KEY; 
async function printWelcomeMessage() {
    console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟bactiar291⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐");
}

function clearConsole() {
    console.clear();
}

async function validateKey() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question("Masukkan kunci untuk melanjutkan: ", key => {
            rl.close();
            resolve(key === VALID_KEY);
        });
    });
}

async function fetchAccessToken(initData) {
    const url = "https://api.cyberfin.xyz/api/v1/game/initdata";
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'secret-key': 'cyberfinance',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
    };
    const data = JSON.stringify({ initData });
    try {
        const response = await axios.post(url, data, { headers });
        return response.status === 201 ? response.data.message.accessToken : null;
    } catch (error) {
        console.error("Failed to fetch access token");
        return null;
    }
}

function readTokens() {
    return fs.readFileSync('initdata.txt', 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
}

async function infoBalance(iniToken) {
    const url = "https://api.cyberfin.xyz/api/v1/game/mining/gamedata";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`
    };
    try {
        const response = await axios.get(url, { headers });
        const crackTime = response.data.message.miningData.crackTime;
        const now = Date.now();
        const countdown = crackTime - now;
        const hours = Math.floor(countdown / 3600000);
        const minutes = Math.floor((countdown % 3600000) / 60000);
        console.log(`[ Cracking ]: ${hours} Jam ${minutes} Menit lagi untuk claim`);
    } catch (error) {
        console.error("Failed to fetch balance info");
    }
}

async function claimMining(iniToken) {
    const url = "https://api.cyberfin.xyz/api/v1/mining/claim";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`
    };
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Failed to claim mining");
        return null;
    }
}

async function autoUpgradeHammer(iniToken, maxLevel) {
    const url = "https://api.cyberfin.xyz/api/v1/mining/boost/apply";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`,
        'content-type': 'application/json'
    };
    const data = JSON.stringify({ boostType: "HAMMER" });

    while (true) {
        try {
            const response = await axios.post(url, data, { headers });
            const currentLevel = response.data.message.boostData.hammerLevel;
            process.stdout.write(`\r[ Hammer ] Sukses Upgrade. Level: ${currentLevel}`);
            if (currentLevel >= maxLevel) {
                console.log(`\n[ Hammer ] Already at level ${currentLevel}`);
                break;
            }
        } catch (error) {
            console.error("[ Hammer ]: Saldo tidak cukup");
            break;
        }
    }
}

async function autoUpgradeEgg(iniToken, maxLevel) {
    const url = "https://api.cyberfin.xyz/api/v1/mining/boost/apply";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`,
        'content-type': 'application/json'
    };
    const data = JSON.stringify({ boostType: "EGG" });

    while (true) {
        try {
            const response = await axios.post(url, data, { headers });
            const currentLevel = response.data.message.boostData.eggLevel;
            process.stdout.write(`\r[ Egg Level ] Sukses Upgrade. Level: ${currentLevel}`);
            if (currentLevel >= maxLevel) {
                console.log(`\n[ Egg Level ] Already at level ${currentLevel}`);
                break;
            }
        } catch (error) {
            console.error("[ Egg Level ]: Saldo tidak cukup");
            break;
        }
    }
}

async function fetchUuids(iniToken) {
    const url = "https://api.cyberfin.xyz/api/v1/gametask/all";
    const headers = {
        'Authorization': `Bearer ${iniToken}`,
        'accept': 'application/json'
    };
    try {
        const response = await axios.get(url, { headers });
        const tasks = response.data.message;
        return tasks.filter(task => !task.isCompleted).map(task => [task.uuid, task.description]);
    } catch (error) {
        console.error("Failed to fetch tasks");
        return [];
    }
}

async function completeTasks(uuids, iniToken) {
    const baseUrl = "https://api.cyberfin.xyz/api/v1/gametask/complete/";
    const headers = {
        'Authorization': `Bearer ${iniToken}`,
        'Content-Type': 'application/json'
    };
    for (const [uuid, description] of uuids) {
        try {
            const response = await axios.patch(`${baseUrl}${uuid}`, {}, { headers });
            console.log(`[ Task ]: ${description} Completed`);
        } catch (error) {
            console.error(`[ Task ]: ${description} Gagal.`);
        }
    }
}

async function userLevel(iniToken) {
    const url = "https://api.cyberfin.xyz/api/v1/mining/boost/info";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`
    };
    try {
        const response = await axios.get(url, { headers });
        return response.data.message;
    } catch (error) {
        console.error("[ Gagal mendapatkan informasi level pengguna ]");
    }
}

async function getMiningInfo(iniToken) {
    const url = "https://api.cyberfin.xyz/api/v1/game/mining/gamedata";
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${iniToken}`
    };
    try {
        const response = await axios.get(url, { headers });
        const data = response.data.message;
        const balance = parseInt(data.userData.balance);
        const miningRate = data.miningData.miningRate;
        return { balance, miningRate };
    } catch (error) {
        console.error("[ Gagal mendapatkan informasi mining ]");
    }
}

async function main() {
    await printWelcomeMessage();
    
    const isValidKey = await validateKey();
    if (!isValidKey) {
        console.error("Kunci tidak valid. Program dihentikan.");
        return; 
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const userInputTask = await new Promise(resolve => {
        rl.question("mau nyelesein semua task ? (y / n) : ", resolve);
    });

    const userInputHammer = await new Promise(resolve => {
        rl.question("otomatis up hammer ( Cracking Power ) ? (y / n) : ", resolve);
    });

    let maxHammerLevel;
    if (userInputHammer === 'y') {
        maxHammerLevel = parseInt(await new Promise(resolve => {
            rl.question("mau sampe lvl brp? : ", resolve);
        }));
    }

    const userInputEgg = await new Promise(resolve => {
        rl.question("otomatis up egg ( Jam per Claim ) ? (y / n) : ", resolve);
    });

    let maxEggLevel;
    if (userInputEgg === 'y') {
        maxEggLevel = parseInt(await new Promise(resolve => {
            rl.question("mau sampe lvl brp? : ", resolve);
        }));
    }

    clearConsole();
    while (true) {
        await printWelcomeMessage();
        const tokens = readTokens();
        for (let index = 0; index < tokens.length; index++) {
            const initData = tokens[index];
            const iniToken = await fetchAccessToken(initData);
            if (!iniToken) continue;

            console.log(`🌟🌟🌟🌟🌟🌟🌟🌟 [ Akun ke-${index + 1} ] 🌟🌟🌟🌟🌟🌟🌟🌟`);
            const profile = await getMiningInfo(iniToken);
            if (profile) {
                const { balance, miningRate } = profile;
                console.log(`[ Balance ]: ${balance}`);
                console.log(`[ Mining Rate ]: ${miningRate}`);

                const datauser = await userLevel(iniToken);
                if (datauser) {
                    const levelHammer = parseInt(datauser.hammerLevel);
                    const levelEgg = parseInt(datauser.eggLevel);
                    console.log(`[ Egg Level ]: ${levelHammer}`);
                    console.log(`[ Hammer Level ]: ${levelEgg}`);
                    
                    if (userInputHammer.toLowerCase() === 'y' && levelHammer < maxHammerLevel) {
                        await autoUpgradeHammer(iniToken, maxHammerLevel);
                    }
                    
                    if (userInputEgg.toLowerCase() === 'y' && levelEgg < maxEggLevel) {
                        await autoUpgradeEgg(iniToken, maxEggLevel);
                    }
                }

                if (userInputTask.toLowerCase() === 'y') {
                    const uuids = await fetchUuids(iniToken);
                    if (uuids.length > 0) {
                        await completeTasks(uuids, iniToken);
                    } else {
                        console.log("[ Gagal ]: Tidak ada tugas yang harus diselesaikan.");
                    }
                }
                console.log("🌟------------------------__________-----------------------🌟");
            }
        }
        console.log("tunggu aja bg...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        clearConsole();
    }
}

main().catch(console.error);
