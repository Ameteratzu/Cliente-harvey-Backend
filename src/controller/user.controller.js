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

module.exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: allUsers, count } = await userService.getAllUsers({
    limit: parsedLimit,
    offset,
  });

  return res.status(200).json({
    page: parsedPage,
    results: allUsers.length,
    total: count,
    totalPages: Math.ceil(count / parsedLimit),
    users: allUsers,
  });
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
