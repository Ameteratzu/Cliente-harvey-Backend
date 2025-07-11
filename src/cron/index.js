const cron = require("node-cron");
const blockInactiveAccounts = require("./blockInactiveUsers.js");
const markExpiredPurchases = require("./markedExpiredPurchases.js");
const deleteExpiredPublication = require("./deleteExpiredPublication.js");

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

  // ELIMINAR LA PUBLICACION a las 3 am de cada dia 0 3 * * *
  cron.schedule("0 3 * * *", async () => {
    console.log("✅ Eliminando publicaciones vencidas...");
    await deleteExpiredPublication();
  });
};

module.exports = runCrons;
