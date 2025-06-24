const { validationResult, body, param } = require("express-validator");

const db = require("./../database/models/index.js");

const validFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", errors: errors.mapped() });
  }

  next();
};

// user
module.exports.validationRegisterUser = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 8, max: 12 })
    .withMessage("El nombre de usuario debe tener entre 8 y 12 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const user = await db.Users.findOne({
        where: { username: removeSpace },
      });
      if (user) {
        throw new Error("El nombre de usuario ya está en uso");
      }
      return true;
    })
    .escape(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("El email es obligatorio y debe ser válido")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(removeSpace)) {
        throw new Error("El email debe ser válido");
      }
      const user = await db.Users.findOne({
        where: { email: removeSpace },
      });
      if (user) {
        throw new Error("El email ya está en uso");
      }
      return true;
    })
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .escape(),
  body("telephone")
    .notEmpty()
    .withMessage("El número de teléfono es obligatorio")
    .isLength({ min: 10 })
    .withMessage("El número de teléfono debe tener al menos 10 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const user = await db.Users.findOne({
        where: { telephone: removeSpace },
      });
      if (user) {
        throw new Error("El número de teléfono ya está en uso");
      }
      return true;
    })
    .escape(),
  body("codeRegister")
    .notEmpty()
    .withMessage("El token de registro es obligatorio")
    .escape(),
  validFields,
];

module.exports.validationLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("El email es obligatorio y debe ser válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  validFields,
];

module.exports.validationConfirmAccount = [
  param("code").notEmpty().withMessage("Token expirado o incorrecto"),
  validFields,
];

module.exports.validationSendEmailCodeRecover = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("El email es obligatorio y debe ser válido"),
  validFields,
];

module.exports.validationChangePassword = [
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("confirm-password")
    .notEmpty()
    .withMessage("La confirmación de la contraseña es obligatoria")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    }),
  validFields,
];

module.exports.validationEditUser = [
  body("telephone")
    .notEmpty()
    .withMessage("El número de teléfono es obligatorio")
    .isLength({ min: 10 })
    .withMessage("El número de teléfono debe tener al menos 10 caracteres"),
  validFields,
];

// provider
module.exports.validationRegisterProvider = [
  body("businessName")
    .optional()
    .if(body("businessName").exists())
    .notEmpty()
    .withMessage("El nombre de la empresa es obligatorio")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const provider = await db.Providers.findOne({
        where: { businessName: removeSpace },
      });
      if (provider) {
        throw new Error("El nombre de la empresa ya está en uso");
      }
      return true;
    })
    .escape(),
  body("username")
    .notEmpty()
    .withMessage("El nombre de proveedor es obligatorio")
    .isLength({ min: 8, max: 12 })
    .withMessage("El usuario de proveedor debe tener entre 8 y 12 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const provider = await db.Providers.findOne({
        where: { username: removeSpace },
      });
      if (provider) {
        throw new Error("El nombre de proveedor ya está en uso");
      }
      return true;
    })
    .escape(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("El email es obligatorio y debe ser válido")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(removeSpace)) {
        throw new Error("El email debe ser válido");
      }
      const provider = await db.Providers.findOne({
        where: { email: removeSpace },
      });
      if (provider) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .escape(),
  body("telephone")
    .notEmpty()
    .withMessage("El número de teléfono es obligatorio")
    .isLength({ min: 10 })
    .withMessage("El número de teléfono debe tener al menos 10 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const provider = await db.Providers.findOne({
        where: { telephone: removeSpace },
      });
      if (provider) {
        throw new Error("El número de teléfono ya está en uso");
      }
      return true;
    })
    .escape(),
  body("codeRegister")
    .notEmpty()
    .withMessage("El token de registro es obligatorio")
    .escape(),
  validFields,
];

// admin
module.exports.validationRegisterAdmin = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 8, max: 12 })
    .withMessage("El nombre de usuario debe tener entre 8 y 12 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const admin = await db.Admins.findOne({
        where: { username: removeSpace },
      });
      if (admin) {
        throw new Error("El nombre de usuario ya está en uso");
      }
      return true;
    }),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("El email es obligatorio y debe ser válido")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const admin = await db.Admins.findOne({
        where: { email: removeSpace },
      });
      if (admin) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .escape(),
  validFields,
  body("telephone")
    .notEmpty()
    .withMessage("El número de teléfono es obligatorio")
    .isLength({ min: 10 })
    .withMessage("El número de teléfono debe tener al menos 10 caracteres")
    .custom(async (value) => {
      const removeSpace = value.replace(/\s/g, "");
      const admin = await db.Admins.findOne({
        where: { telephone: removeSpace },
      });
      if (admin) {
        throw new Error("El número de teléfono ya está en uso");
      }
      return true;
    })
    .escape(),
  body("codeRegister")
    .notEmpty()
    .withMessage("El token de registro es obligatorio")
    .escape(),
  validFields,
];

// validate category
module.exports.validationCreateCategory = [
  body("category")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .escape(),
  validFields,
];

module.exports.validationParamId = [
  param("id").isInt().withMessage("Id no es válido"),
  validFields,
];

module.exports.validationEditCategory = [
  body("category")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .escape(),
  param("id").notEmpty().withMessage("Id no es válido"),
  validFields,
];

// validate product
module.exports.validationCreateProduct = [
  body("productName")
    .notEmpty()
    .withMessage("El nombre del producto es obligatorio")
    .escape(),
  body("termsOfUse")
    .notEmpty()
    .withMessage("Las condiciones de uso son obligatorias")
    .escape(),
  body("duration") // duracion en dias - enteros
    .notEmpty()
    .withMessage("La duración es obligatoria")
    .escape(),
  body("publishStartDate") // opcional
    .optional()
    .if(body("publishStartDate").exists())
    .isDate()
    .withMessage("La fecha de inicio de publicación debe ser una fecha")
    .escape(),
  body("publishEndDate") // opcional
    .optional()
    .if(body("publishEndDate").exists())
    .isDate()
    .withMessage("La fecha de fin de publicación debe ser una fecha")
    .escape(),
  body("regularPrice")
    .isNumeric()
    .withMessage("El precio regular debe ser un número")
    .escape(),
  body("salePrice")
    .optional()
    .if(body("salePrice").exists())
    .isNumeric()
    .withMessage("El precio de venta debe ser un número")
    .escape(),
  body("renewalPrice")
    .optional()
    .if(body("renewalPrice").exists())
    .isNumeric()
    .withMessage("El precio de renovación debe ser un número")
    .escape(),
  body("typeOfDelivery")
    .notEmpty()
    .withMessage("El tipo de entrega es obligatorio")
    .isIn(["selfDelivery", "uponRequest"])
    .withMessage("El tipo de entrega debe ser 'selfDelivery' o 'uponRequest'")
    .escape(),
  body("productUrl")
    .notEmpty()
    .withMessage("La URL es obligatoria")
    .isString()
    .withMessage("La URL debe ser una cadena de texto")
    .escape(),
  body("categoryId")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .escape(),
  validFields,
];

module.exports.validationPutProductOnSale = [
  param("id").notEmpty().withMessage("Id no es válido"),
  body("salePrice")
    .isNumeric()
    .withMessage("El precio de venta debe ser un número")
    .escape(),
  validFields,
];

module.exports.validationEditProduct = [
  param("id").isInt().withMessage("ID inválido"),

  body("productCode")
    .optional()
    .isString()
    .withMessage("El código del producto debe ser texto"),

  body("productName")
    .optional()
    .isString()
    .withMessage("El nombre del producto debe ser texto"),

  body("termsOfUse")
    .optional()
    .isString()
    .withMessage("Los términos de uso deben ser texto"),

  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La duración debe ser un número entero positivo"),

  body("regularPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio regular debe ser un número positivo"),

  body("renewalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio de renovación debe ser un número positivo"),

  body("providerId")
    .optional()
    .isInt()
    .withMessage("El ID del proveedor debe ser un número entero"),

  body("categoryId")
    .optional()
    .isInt()
    .withMessage("El ID de la categoría debe ser un número entero"),

  body("url").optional().isURL().withMessage("La URL debe ser válida"),

  validFields,
];
