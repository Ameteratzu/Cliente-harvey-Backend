const { Op } = require("sequelize");
const db = require("../database/models/index.js");
const { toZonedTime } = require("date-fns-tz");

async function markExpiredPurchases() {
  const now = toZonedTime(new Date(), "America/Lima");

  try {
    const updated = await db.Purchase.update(
      { status: "beaten" },
      {
        where: {
          expirationDate: {
            [Op.lt]: now,
          },
          status: {
            [Op.ne]: "beaten",
          },
        },
      }
    );

    console.log(`[CRON] Compras vencidas actualizadas: ${updated[0]}`);
  } catch (error) {
    console.error("[CRON] Error actualizando compras vencidas:", error.message);
  }
}

module.exports = markExpiredPurchases;
