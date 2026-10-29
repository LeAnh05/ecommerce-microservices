require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const memberships = [
        { mid: 1, mname: "NORMAL" },
        { mid: 2, mname: "SILVER" },
        { mid: 3, mname: "GOLD" },
    ];

    for (const membership of memberships) {
        await prisma.memberShip.upsert({
            where: { mid: membership.mid },
            update: { mname: membership.mname },
            create: membership,
        });
    }

    console.log("Seed Membership completed successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });