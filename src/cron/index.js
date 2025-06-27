const cron = require("node-cron");
const blockInactiveAccounts = require("./blockInactiveUsers.js");
const markExpiredPurchases = require("./markedExpiredPurchases.js");

const runCrons = () => {
  // cada domingo
  cron.schedule("0 0 * * 0", () => {
    console.log("✅ Ejecutando bloqueo de cuentas inactivas...");
    blockInactiveAccounts();
  });

  // cada día a media noche
  cron.schedule("0 0 * * *", async () => {
    console.log("✅ Ejecutando actualización de compras vencidas...");
    await markExpiredPurchases();
  });
};

module.exports = runCrons;
