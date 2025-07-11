module.exports = verifyUserTypeQuery = (req, res, next) => {
  const { userType } = req.query;
  if (!userType || !["user", "provider", "admin"].includes(userType)) {
    return res.status(400).json({
      message:
        "La query userType (user, provider, admin) es requerida para iniciar sesión",
    });
  }
  next();
};
