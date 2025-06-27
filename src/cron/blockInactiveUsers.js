const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const { subDays } = require("date-fns");

const blockInactiveAccounts = async () => {
  const sixtyDaysAgo = subDays(new Date(), 60);

  try {
    console.log("⏳ Iniciando bloqueo de cuentas inactivas...");

    // Bloquear Providers
    const inactiveProviders = await db.Providers.findAll({
      where: {
        status: "active",
        updatedAt: { [Op.lt]: sixtyDaysAgo },
      },
      include: [
        {
          model: db.Wallet,
          as: "wallet",
          required: false,
          where: { createdAt: { [Op.gte]: sixtyDaysAgo } },
        },
        {
          model: db.PublishedProducts,
          as: "publishedProducts",
          required: false,
          where: { createdAt: { [Op.gte]: sixtyDaysAgo } },
        },
      ],
    });

    console.log({ inactiveProviders });

    for (const provider of inactiveProviders) {
      const noMovements = !provider.wallet?.length;

      if (noMovements) {
        provider.status = "blocked";
        await provider.save();
        console.log(`🔒 Proveedor bloqueado: ${provider.business_name}`);
      }
    }

    // Bloquear Users
    const inactiveUsers = await db.Users.findAll({
      where: {
        status: "active",
        updatedAt: { [Op.lt]: sixtyDaysAgo },
      },
      include: [
        {
          model: db.Purchase,
          as: "purchases",
          required: false,
          where: { createdAt: { [Op.gte]: sixtyDaysAgo } },
        },
        {
          model: db.Wallet,
          as: "wallet",
          required: false,
          where: { createdAt: { [Op.gte]: sixtyDaysAgo } },
        },
      ],
    });

    console.log({ inactiveUsers });

    for (const user of inactiveUsers) {
      const noPurchases = !user.purchases?.length;
      const noMovements = !user.wallet?.length;
      console.log({ noMovements, noPurchases });
      console.log({ lu: user.purchases.length, lw: user.wallet.length });

      if (noPurchases && noMovements) {
        user.status = "blocked";
        await user.save();
        console.log(`🔒 Usuario bloqueado: ${user.username || user.email}`);
      }
    }

    console.log("✅ Proceso de bloqueo completado.");
  } catch (error) {
    console.error("❌ Error al bloquear cuentas inactivas:", error);
  }
};

module.exports = blockInactiveAccounts;
