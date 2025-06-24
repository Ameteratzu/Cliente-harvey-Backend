const { isBefore } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

function isAccountBloqued(user) {
  if (!user.lockedUntil) return false;

  const timezone = "America/Lima";
  const now = toZonedTime(new Date(), timezone);

  return isBefore(now, new Date(user.lockedUntil));
}

module.exports = {
  isAccountBloqued,
};
