const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const details = await prisma.userAccountDetails.findMany();
    console.log(`Found ${details.length} account details.`);
    
    for (const detail of details) {
        console.log(`UID: ${detail.game_uid}`);
        let info = {};
        try {
            info = JSON.parse(detail.account_info);
        } catch (e) {
            console.error("Failed to parse JSON");
            continue;
        }
        
        console.log("Characters in contract:");
        const contractChars = info.contract?.chars || [];
        for (const char of contractChars.slice(0, 5)) {
            console.log(` - ID: ${char.id}, Name: ${char.name}, Level: ${char.level}, PotentialLevel: ${char.potentialLevel}, Potential: ${char.potential}`);
            if (char.weapon) {
                console.log(`   Weapon ID: ${char.weapon.id}, RefineLevel: ${char.weapon.refineLevel}`);
            }
        }
        
        console.log("Characters in roster:");
        const chars = info.chars || [];
        for (const char of chars.slice(0, 5)) {
             console.log(` - ID: ${char.id}, Name: ${char.name}, Level: ${char.level}, PotentialLevel: ${char.potentialLevel}, Potential: ${char.potential}`);
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
