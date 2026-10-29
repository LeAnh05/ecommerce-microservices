const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const role = await prisma.role.upsert({
        where: { rolename: "USER" },
        update: {},
        create: {
            roleid: 1,
            rolename: "USER",
        },
    });

    console.log("Role created:", role);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });