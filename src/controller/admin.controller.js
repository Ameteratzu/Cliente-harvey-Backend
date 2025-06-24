const AdminService = require("../services/admin.service.js");
const AuthService = require("../services/auth.service.js");
const catchAsync = require("../utils/catchAsync.js");

const authService = new AuthService();
const adminService = new AdminService();

module.exports.register = catchAsync(async (req, res) => {
  const admin = await authService.register({
    userData: req.body,
    userType: req.userType,
  });

  return res.status(201).json({ message: "Cuenta creado con éxito", admin });
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

  return res.status(200).json(user);
});

module.exports.logout = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const result = await authService.logout({
    userId,
    userType: req.userType,
    res,
  });
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

module.exports.getAllUserTypes = catchAsync(async (req, res) => {
  const allAdmins = await adminService.getAllAdmins();

  return res.status(200).json({ allAdmins, results: allAdmins.length });
});

module.exports.getAdminById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const admin = await adminService.getAdminById(id);

  return res.status(200).json(admin);
});

module.exports.editAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { telephone } = req.body;

  const admin = await adminService.getAdminById(id);

  if (admin.telephone === telephone) {
    return res
      .status(400)
      .json({ message: "El número de teléfono no puede ser el mismo" });
  }

  await adminService.editAdmin({ id, telephone });

  return res.status(200).json({ message: "Cuenta actualizado con éxito" });
});

module.exports.blockAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  await adminService.blockAccountById({ id, role });
  return res.status(200).json({ message: "Cuenta bloqueada con éxito" });
});

module.exports.unblockAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  await adminService.unblockAccountById({ id, role });
  return res.status(200).json({ message: "Cuenta desbloqueada con éxito" });
});

module.exports.deleteProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  await adminService.deleteProfileById({ id, role });
  return res.status(200).json({ message: "Perfil eliminado con éxito" });
});
