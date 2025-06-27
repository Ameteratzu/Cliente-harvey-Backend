const db = require("../database/models/index.js");
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

module.exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login({
    email,
    password,
    userType: req.userType,
    req,
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });
  console.log({ token });
  return res.status(200).json(user);
});

module.exports.logout = catchAsync(async (req, res) => {
  const result = await authService.logout(req.user.id, req.userType, res);
  return res.status(200).json(result);
});

module.exports.confirmAccount = catchAsync(async (req, res) => {
  const { code } = req.params;

  const result = await authService.confirmAccount({
    code,
    userType: req.userType,
  });
  return res.status(200).json(result);
});

module.exports.sendEmailCodeRecover = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await authService.sendEmailCodeRecover({
    email,
    userType: req.userType,
  });
  return res.status(200).json(result);
});

module.exports.changePassword = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { password } = req.body;

  const result = await authService.changePassword({
    code,
    password,
    userType: req.userType,
  });
  return res.status(200).json(result);
});

module.exports.sendEmailCodeChangeTelephone = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { role: userType } = req.user;

  const result = await authService.sendEmailCodeChangeTelephone({
    email,
    userType,
  });
  return res.status(200).json(result);
});

module.exports.changeTelephone = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { telephone } = req.body;
  const { role: userType } = req.user;

  const result = await authService.changeTelephone({
    code,
    telephone,
    userType,
  });
  return res.status(200).json(result);
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

module.exports.editUser = catchAsync(async (req, res) => {
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

  await db.Providers.update({ telephone }, { where: { id } });

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
