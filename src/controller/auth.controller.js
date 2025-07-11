const catchAsync = require("../utils/catchAsync.js");
const AuthService = require("../services/auth.service.js");
const authService = new AuthService();

module.exports.authMe = catchAsync(async (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({ status: "fail", message: "No autorizado" });
  }

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      codeUser: user.codeUser,
      totalBalance: user.totalBalance,
    },
  });
});

module.exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { userType } = req.query;

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  const loginArgs = {
    email,
    password,
    userType,
    userAgent,
    ipAddress,
  };

  const { auth: user, token } = await authService.login(loginArgs);

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  // res.cookie("auth_token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // obligatorio en producción para HTTPS
  //   sameSite: "None", // esto permite que la cookie viaje entre sitios
  //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días o lo que necesites
  // });

  return res.status(200).json({ message: "Sessión iniciada con éxito", user });
});

module.exports.logout = catchAsync(async (req, res) => {
  console.log(req.user.id, req.user.role);
  const { id, role: userType } = req.user;

  const result = await authService.logout({ id: +id, userType, res });

  return res.status(200).json(result);
});

module.exports.sendEmailCodeRecover = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { userType } = req.query;

  const result = await authService.sendEmailCodeRecover({ email, userType });

  return res.status(200).json(result);
});

module.exports.changePassword = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { userType } = req.query;
  const { password } = req.body;

  const result = await authService.changePassword({
    code,
    password,
    userType,
  });

  return res.status(200).json(result);
});

module.exports.confirmAccount = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { userType } = req.query;

  const result = await authService.confirmAccount({ code, userType });

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
  const { userType } = req.query;

  const result = await authService.changeTelephone({
    code,
    telephone,
    userType,
  });

  return res.status(200).json(result);
});
