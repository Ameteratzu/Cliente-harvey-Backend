module.exports = (req, res, next) => {
  const baseUrl = req.baseUrl.toLowerCase();
  const pathToTyMap = {
    "/api/v1/users": "user",
    "/api/v1/providers": "provider",
    "/api/v1/admins": "admin",
  };

  const userType = pathToTyMap[baseUrl];

  if (!userType) {
    return res.status(400).json({ message: "Ruta de usuario no válida" });
  }

  req.userType = userType;
  next();
};
