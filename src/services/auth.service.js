const crypto = require("node:crypto");
const db = require("../database/models/index.js");
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

  async register(userData, userType) {
    const Model = this.getModel(userType);
    const { password, codeRegister, ...rest } = userData;

    const findCodeRegister = await db.RegistrationCodes.findOne({
      where: { code: codeRegister },
    });

    if (!findCodeRegister || findCodeRegister.roleType !== userType) {
      throw new Error("Código de registro no válido");
    }

    const hashedPassword = await hashPassword(password);
    const codeUser = await generateUserCode();

    const newUser = await Model.create({
      ...rest,
      password: hashedPassword,
      codeUser,
      role: userType,
    });

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

  async login(email, password, userType, req) {
    const Model = this.getModel(userType);

    const user = await Model.findOne({ where: { email } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!user.confirmed) {
      throw new Error("Cuenta no confirmada, verifique su correo");
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Contraseña incorrecta");
    }

    const token = await tokenSing(user);

    await db.UserSession.create({
      token,
      userId: user.id,
      userType,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    return { user, token };
  }

  async logout(userId, userType, res) {
    // invalidando todas las sesiones
    await db.UserSession.update(
      { isValid: false },
      { where: { userId, userType } }
    );
    res.clearCookie("auth_token");

    return { message: "Sessión cerrada con éxito" };
  }

  async confirmAccount(code, userType) {
    const Model = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new Error("Código de verificación no válido");
    }

    const user = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });

    await Model.update({ confirmed: true }, { where: { id: user.id } });

    return {
      message: "Cuenta confirmada con éxito",
    };
  }

  async sendEmailCodeRecover(email, userType) {
    const code = crypto.randomBytes(32).toString("hex");
    const user = await this.findByEmail(email, userType);
    if (!user.confirmed) {
      throw new Error(
        "Cuenta no confirmada, verifique su correo primero para cambiar su contraseña"
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

  async changePassword(code, password, userType) {
    const Model = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new Error("Código de verificación no válido");
    }

    const user = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });
    const equalPassword = await comparePassword(password, user.password);

    if (equalPassword) {
      throw new Error("La contraseña no puede ser la misma que la anterior");
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
      message: "Contraseña cambiada con éxito",
    };
  }

  async findByEmail(email, userType) {
    const Model = this.getModel(userType);
    return await Model.findOne({ where: { email } });
  }
}

module.exports = AuthService;
