const crypto = require("node:crypto");
const db = require("../database/models/index.js");
const AppError = require("../utils/appError.js");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { sendEmailCodeRecoverPassword } = require("../utils/sendEmail");
const { generateUserCode, tokenSing } = require("../utils/token");

class AuthService {
  getModel(userType) {
    const models = {
      user: db.Users,
      admin: db.Admins,
      provider: db.Providers,
    };

    return models[userType];
  }

  async register({ userData, userType }) {
    const Model = this.getModel(userType);
    const { password, codeRegister, codeReferral, ...rest } = userData;

    const findCodeRegister = await db.RegistrationCodes.findOne({
      where: { code: codeRegister },
    });

    if (!findCodeRegister || findCodeRegister.roleType !== userType) {
      throw new AppError("Código de registro no válido", 400);
    }

    const codeUser = await generateUserCode();

    const hashedPassword = await hashPassword(password);

    const newUser = await Model.create({
      ...rest,
      password: hashedPassword,
      codeUser,
      role: userType,
    });

    if (codeReferral) {
      const findCodeReferral = await db.Users.findOne({
        where: { codeUser: codeReferral },
      });

      // TODO: SI EL CODIGO DE REFERIDO ES INVALIDO, NO DEBERIA CREAR UN USUARIO
      if (!findCodeReferral) {
        throw new AppError("Código de referido no valido", 400);
      }

      await db.Referrals.create({
        userId: findCodeReferral.id,
        referralUserId: newUser.id,
      });
    }

    await db.RegistrationCodes.destroy({ where: { code: codeRegister } });

    const emailCode = crypto.randomBytes(32).toString("hex");
    await sendEmailCodeRecoverPassword(newUser, emailCode);
    await db.EmailCode.create({
      code: emailCode,
      targetId: newUser.id,
      targetType: userType,
    });

    return newUser;
  }

  async login({ email, password, userType, req }) {
    const Model = this.getModel(userType);

    const user = await Model.findOne({
      where: { email },
    });
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (user.status === "pending_verification") {
      throw new AppError("Cuenta no confirmada, revisa tu correo", 400);
    }

    if (user.status === "blocked") {
      throw new AppError(
        "Cuenta bloqueada, contacte con el administrador",
        401
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Contraseña incorrecta", 400);
    }

    const token = await tokenSing(user);

    await db.UserSession.create({
      token,
      userId: user.id,
      userType,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      codeUser: user.codeUser,
    };

    return { user: userPayload, token };
  }

  async logout({ userId, userType, res }) {
    // invalidando todas las sesiones
    await db.UserSession.update(
      { isValid: false },
      { where: { userId, userType } }
    );
    res.clearCookie("auth_token");

    return { message: "Sessión cerrada con éxito" };
  }

  async confirmAccount({ code, userType }) {
    const Model = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new AppError("Código de verificación no válido", 400);
    }

    const user = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });

    await Model.update({ confirmed: true }, { where: { id: user.id } });

    return {
      message: "Cuenta confirmada con éxito",
    };
  }

  async sendEmailCodeRecover({ email, userType }) {
    const code = crypto.randomBytes(32).toString("hex");
    const user = await this.findByEmail(email, userType);
    if (!user.confirmed) {
      throw new AppError(
        "Cuenta no confirmada, verifique su correo primero para cambiar su contraseña",
        400
      );
    }

    await sendEmailCodeRecoverPassword(user, code);
    await db.EmailCode.create({
      code,
      targetId: user.id,
      targetType: user.role,
    });

    return {
      message: "Código de verificación enviado con éxito",
      code,
    };
  }

  async changePassword({ code, password, userType }) {
    const Model = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new AppError("Código de verificación no válido", 400);
    }

    const user = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });
    const equalPassword = await comparePassword(password, user.password);

    if (equalPassword) {
      throw new AppError(
        "La contraseña no puede ser la misma que la anterior",
        400
      );
    }

    const hashedPassword = await hashPassword(password);

    await Model.update(
      { password: hashedPassword },
      { where: { id: user.id } }
    );

    await db.UserSession.update(
      { isValid: false },
      { where: { userId: user.id, userType } }
    );

    return {
      message: "Contraseña cambiada con éxito",
    };
  }

  async findByEmail(email, userType) {
    const Model = this.getModel(userType);
    return await Model.findOne({ where: { email } });
  }
}

module.exports = AuthService;
