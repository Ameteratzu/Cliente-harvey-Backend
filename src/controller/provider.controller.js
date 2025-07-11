const catchAsync = require("../utils/catchAsync.js");
const ProviderService = require("../services/provider.service.js");
const AuthService = require("../services/auth.service.js");

const authService = new AuthService();
const providerService = new ProviderService();

module.exports.register = catchAsync(async (req, res) => {
  const provider = await authService.register({
    userData: req.body,
    userType: req.userType,
  });

  return res
    .status(201)
    .json({ message: "Proveedor creado con éxito", provider });
});

module.exports.getAllProviders = catchAsync(async (req, res) => {
  const providers = await providerService.getAllProviders();
  return res.status(200).json({ providers });
});

module.exports.getProviderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const provider = await providerService.getProviderById(id);

  if (!provider) {
    return res.status(404).json({ message: "Proveedor no encontrado" });
  }

  return res.status(200).json({ provider });
});

module.exports.editProvider = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { telephone } = req.body;

  const provider = await providerService.getProviderById(id);

  if (!provider) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  if (provider.telephone === telephone) {
    return res
      .status(400)
      .json({ message: "El número de teléfono no puede ser el mismo" });
  }

  await provider.update({ telephone });

  return res.status(200).json({ message: "Usuario actualizado con éxito" });
});

module.exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  await providerService.deleteProviderById(id);
  return res.status(200).json({ message: "Usuario eliminado con éxito" });
});

module.exports.getProfile = catchAsync(async (req, res) => {
  const { id, role } = req.user;
  const userType = req.userType;

  if (role !== userType) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const userProfile = await providerService.getProviderById(id);
  if (!userProfile) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.status(200).json({ profile: userProfile });
});
