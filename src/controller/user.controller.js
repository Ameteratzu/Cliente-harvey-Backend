const catchAsync = require("../utils/catchAsync.js");
const UserService = require("./../services/user.service.js");
const AuthService = require("../services/auth.service.js");

const authService = new AuthService();
const userService = new UserService();

module.exports.register = catchAsync(async (req, res) => {
  const { body, userType } = req;

  const newUser = await authService.register({ userData: body, userType });
  return res.status(201).json({ message: "Usuario creado con éxito", newUser });
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
  const { userType } = req;

  const result = await authService.logout({ userId, userType, res });
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

module.exports.getAllUsers = catchAsync(async (req, res) => {
  const allUsers = await userService.getAllUsers();

  return res.status(200).json({ allUsers, results: allUsers.length });
});

module.exports.getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  return res.status(200).json({ user });
});

module.exports.editUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { telephone } = req.body;

  const user = await userService.getUserById(id);

  if (user.telephone === telephone) {
    return res
      .status(400)
      .json({ message: "El número de teléfono no puede ser el mismo" });
  }

  await userService.editUser({ id, telephone });

  return res.status(200).json({ message: "Usuario actualizado con éxito" });
});

module.exports.getProfile = catchAsync(async (req, res) => {
  const { id } = req.user;

  if (!id) {
    res.status(400).json({ message: "id no valido" });
  }

  const userProfile = await userService.getUserById(id);

  return res.status(200).json({ profile: userProfile });
});
