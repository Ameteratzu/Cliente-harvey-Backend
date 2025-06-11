module.exports = checkRole = (...roles) => {
  return (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res
        .status(401)
        .json({ message: "No tienes permiso para realizar esta acción" });
    }
    next();
  };
};
