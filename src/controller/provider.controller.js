const db = require("../database/models/index.js");
const catchAsync = require("../utils/catchAsync.js");
const ProviderService = require("../services/provider.service.js");
const AuthService = require("../services/auth.service.js");

const authService = new AuthService();
const providerService = new ProviderService();

module.exports.register = catchAsync(async (req, res) => {
  try {
    const provider = await authService.register(req.body, req.userType);
    return res
      .status(201)
      .json({ message: "Proveedor creado con éxito", provider });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await authService.login(
      email,
      password,
      req.userType,
      req
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24,
    });
    console.log({ token });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.logout = catchAsync(async (req, res) => {
  try {
    const result = await authService.logout(req.user.id, req.userType, res);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports.confirmAccount = catchAsync(async (req, res) => {
  const { code } = req.params;

  try {
    const result = await authService.confirmAccount(code, req.userType);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports.sendEmailCodeRecover = catchAsync(async (req, res) => {
  const { email } = req.body;

  try {
    const result = await authService.sendEmailCodeRecover(email, req.userType);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports.changePassword = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { password } = req.body;

  try {
    const result = await authService.changePassword(
      code,
      password,
      req.userType
    );
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports.getAllProviders = catchAsync(async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.getProviderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const provider = await providerService.getProviderById(id);

    if (!provider) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    return res.status(200).json({ provider });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.editUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { telephone } = req.body;

  try {
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
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    await providerService.deleteProviderById(id);
    return res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.getProfile = catchAsync(async (req, res) => {
  try {
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
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
});
