const crypto = require("node:crypto");
const db = require("../database/models/index.js");
const AppError = require("../utils/appError.js");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const {
  sendEmailCodeRecoverPassword,
  sendEmailCodeVerificationAccount,
  sendEmailCodeChangeTelephone,
} = require("../utils/sendEmail");
const { generateUserCode, tokenSing } = require("../utils/token");

class AuthService {
  getModel(userType) {
    const models = {
      user: { model: db.Users, codeField: "codeUser" },
      admin: { model: db.Admins, codeField: null },
      provider: { model: db.Providers, codeField: "codeProvider" },
    };

    return models[userType];
  }

  async register({ userData, userType }) {
    const transaction = await db.sequelize.transaction();

    try {
      const { model: Model, codeField } = this.getModel(userType);
      const { password, codeRegister, codeReferral, businessName, ...rest } =
        userData;

      // Validación del código de registro
      const registerCode = await db.RegistrationCodes.findOne({
        where: { code: codeRegister },
        transaction,
      });

      if (!registerCode || registerCode.roleType !== userType) {
        throw new AppError("Código de registro no válido", 400);
      }

      const hashedPassword = await hashPassword(password);
      const userCode = await generateUserCode();

      // Construcción de datos comunes
      const dataCreate = {
        ...rest,
        password: hashedPassword,
        role: userType,
      };

      // Agregar campos especiales según el tipo
      if (userType === "provider") {
        dataCreate.businessName = businessName;
      }

      if (codeField) {
        dataCreate[codeField] = userCode;
      }

      const newUser = await Model.create(dataCreate, { transaction });

      // Manejo de referido (solo para user/provider)
      if (codeReferral && (userType === "user" || userType === "provider")) {
        const referredBy = await db.Users.findOne({
          where: { codeUser: codeReferral },
          transaction,
        });

        if (!referredBy) {
          throw new AppError("Código de referido no válido", 400);
        }

        await db.Referrals.create(
          {
            userId: referredBy.id,
            referralUserId: newUser.id,
          },
          { transaction }
        );
      }

      // Eliminar código de registro usado
      await db.RegistrationCodes.destroy({
        where: { code: codeRegister },
        transaction,
      });

      // Generar código de verificación de email
      const emailCode = crypto.randomBytes(32).toString("hex");

      await sendEmailCodeVerificationAccount(newUser, emailCode);

      await db.EmailCode.create(
        {
          code: emailCode,
          targetId: newUser.id,
          targetType: userType,
        },
        { transaction }
      );

      await transaction.commit();
      return newUser;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async login({ email, password, userType, userAgent, ipAddress }) {
    const { model: Model } = this.getModel(userType);

    const account = await Model.findOne({
      where: { email },
    });
    if (!account) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (account.status === "pending_verification") {
      throw new AppError("Cuenta no confirmada, revisa tu correo", 400);
    }

    if (account.status === "blocked") {
      throw new AppError(
        "Cuenta bloqueada, contacte con el administrador",
        401
      );
    }

    const isValidPassword = await comparePassword(password, account.password);
    if (!isValidPassword) {
      throw new AppError("Contraseña incorrecta", 400);
    }

    const token = await tokenSing(account);

    await db.UserSession.create({
      token,
      userId: account.id,
      userType,
      userAgent,
      ipAddress,
    });

    const accountPayload = {
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role,
      codeUser: account.codeUser,
      totalBalance: account.totalBalance,
    };

    return { auth: accountPayload, token };
  }

  async logout({ id, userType, res }) {
    // invalidando todas las sesiones
    await db.UserSession.update(
      { isValid: false },
      { where: { userId: id, userType } }
    );

    res.clearCookie("auth_token");

    return { message: "Sessión cerrada con éxito" };
  }

  async confirmAccount({ code, userType }) {
    const { model: Model } = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new AppError("Código de verificación no válido", 400);
    }

    const user = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });

    await Model.update({ status: "active" }, { where: { id: user.id } });

    return {
      message: "Cuenta confirmada con éxito",
    };
  }

  async sendEmailCodeRecover({ email, userType }) {
    const code = crypto.randomBytes(32).toString("hex");

    const account = await this.findByEmail(email, userType);

    if (account.status === "pending_verification") {
      throw new AppError(
        "Cuenta no confirmada, verifique su correo primero para cambiar su contraseña",
        400
      );
    }

    await sendEmailCodeRecoverPassword(account, code);
    await db.EmailCode.create({
      code,
      targetId: account.id,
      targetType: account.role,
    });

    return {
      message: "Enlace enviado con éxito",
      code,
    };
  }

  async sendEmailCodeChangeTelephone({ email, userType }) {
    const code = crypto.randomBytes(32).toString("hex");

    const account = await this.findByEmail(email, userType);
    if (account.status === "pending_verification") {
      throw new AppError(
        "Cuenta no confirmada, verifique su correo primero para cambiar su teléfono",
        400
      );
    }

    await sendEmailCodeChangeTelephone(account, code);
    await db.EmailCode.create({
      code,
      targetId: account.id,
      targetType: account.role,
    });

    return {
      message: "Enlace enviado con éxito",
      code,
    };
  }

  async changeTelephone({ code, telephone, userType }) {
    const { model: Model } = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new AppError("Código de verificación no válido", 400);
    }

    const account = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!account) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (account.telephone === telephone) {
      throw new AppError("El número de teléfono no puede ser el mismo", 400);
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });

    await Model.update({ telephone }, { where: { id: account.id } });

    return {
      message: "Teléfono cambiado con éxito",
    };
  }

  async changePassword({ code, password, userType }) {
    const { model: Model } = this.getModel(userType);

    const emailCode = await db.EmailCode.findOne({ where: { code } });
    if (!emailCode) {
      throw new AppError("Código de verificación no válido", 400);
    }

    const account = await Model.findOne({ where: { id: emailCode.targetId } });
    if (!account) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await db.EmailCode.destroy({ where: { id: emailCode.id } });
    const equalPassword = await comparePassword(password, account.password);

    if (equalPassword) {
      throw new AppError(
        "La contraseña no puede ser la misma que la anterior",
        400
      );
    }

    const hashedPassword = await hashPassword(password);

    await Model.update(
      { password: hashedPassword },
      { where: { id: account.id } }
    );

    await db.UserSession.update(
      { isValid: false },
      { where: { userId: account.id, userType } }
    );

    return {
      message: "Contraseña cambiada con éxito",
    };
  }

  async findByEmail(email, userType) {
    const { model: Model } = this.getModel(userType);
    const account = await Model.findOne({ where: { email } });
    if (!account) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return account;
  }
}

module.exports = AuthService;
