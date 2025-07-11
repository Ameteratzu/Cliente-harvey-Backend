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

module.exports.getProfile = catchAsync(async (req, res) => {
  const { id } = req.user;

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
