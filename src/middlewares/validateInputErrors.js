const { validationResult, body, param } = require("express-validator");

const db = require("./../database/models/index.js");

const validFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array().map((e) => {
        return {
          field: e.path,
          message: e.msg,
        };
      }),
    });
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
  param("id")
    .notEmpty()
    .withMessage("Id no es válido")
    .isInt()
    .withMessage("Id no es válido"),
  validFields,
];

// validate product

module.exports.validationPutProductOnSale = [
  param("id")
    .notEmpty()
    .withMessage("Id no es válido")
    .isInt()
    .withMessage("Id no es válido"),
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

// CART VALIDATION
module.exports.validationAddToCart = [
  body("productId")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  validFields,
];

// FAVORITE VALIDATION
module.exports.validationAddToFavorite = [
  body("productId")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  validFields,
];

// PRODUCT ITEM VALIDATION
module.exports.validationCreateProductItem = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 6 })
    .withMessage("El nombre de usuario debe tener entre 8 y 12 caracteres")
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .escape(),
  body("url")
    .optional({ checkFalsy: true }) // permite que esté vacío o no enviado
    .isURL()
    .withMessage("La URL debe ser válida")
    .escape(),
  body("productId")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  validFields,
];

// PRODUCT VALIDATION
module.exports.validationCreateProduct = [
  body("categoryId")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isInt()
    .withMessage("La categoría debe ser un entero"),
  body("productName")
    .notEmpty()
    .withMessage("El nombre del producto es obligatorio")
    .isString()
    .withMessage("El nombre del producto debe ser texto")
    .escape(),
  body("termsOfUse")
    .notEmpty()
    .withMessage("Los términos de uso son obligatorios")
    .isString()
    .withMessage("Los términos de uso deben ser texto")
    .escape(),
  body("regularPrice")
    .notEmpty()
    .withMessage("El precio regular es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio regular debe ser un número positivo"),
  body("duration")
    .notEmpty()
    .withMessage("La duración es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La duración debe ser un número entero positivo"),
  body("typeOfDelivery")
    .notEmpty()
    .withMessage("El tipo de entrega es obligatorio")
    .isIn(["selfDelivery", "uponRequest"])
    .withMessage("El tipo de entrega debe ser 'selfDelivery' o 'uponRequest'")
    .escape(),
  validFields,
];

// PROVIDER DISCOUNT VALIDATION
module.exports.validationCreateProviderDiscount = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isIn(["publication_price", "withdrawal"])
    .withMessage("El nombre debe ser 'publication_price' o 'withdrawal'")
    .escape(),
  body("percentage")
    .notEmpty()
    .withMessage("El porcentaje es obligatorio")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El porcentaje debe ser un número entre 0 y 100"),
  body("quantity")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  body("providerId")
    .optional()
    .isInt()
    .withMessage("El ID del proveedor debe ser un número entero"),
  validFields,
];

module.exports.validationEditProviderDiscount = [
  param("id")
    .notEmpty()
    .withMessage("El ID es obligatorio")
    .isInt()
    .withMessage("El ID debe ser un número entero"),
  body("name")
    .optional()
    .isIn(["publication_price", "withdrawal"])
    .withMessage("El nombre debe ser 'publication_price' o 'withdrawal'")
    .escape(),
  body("percentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("El porcentaje debe ser un número entre 0 y 100"),
  body("quantity")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  body("providerId")
    .optional()
    .isInt()
    .withMessage("El ID del proveedor debe ser un número entero"),
  validFields,
];

// PROVIDER VALIDATION
module.exports.validationChangeTelephone = [
  body("telephone")
    .notEmpty()
    .withMessage("El número de teléfono es obligatorio")
    .isLength({ min: 10 })
    .withMessage("El número de teléfono debe tener al menos 10 caracteres")
    .escape(),
  validFields,
];

// PUBLISHED PRODUCTS VALIDATION
module.exports.validationCreatePublishedProduct = [
  body("productId")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  body("publishedEndDate")
    .notEmpty()
    .withMessage("La fecha de finalización es obligatoria")
    .isDate()
    .withMessage("La fecha de finalización debe ser una fecha"),
  validFields,
];

// PURCHASE DISCOUNT VALIDATION
module.exports.validationCreatePurchaseDiscount = [
  body("percentageDiscount")
    .notEmpty()
    .withMessage("El porcentaje de descuento es obligatorio")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El porcentaje de descuento debe ser un número entre 0 y 100"),
  body("quantityProducts")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  body("nameDiscount")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isString()
    .withMessage("El nombre debe ser texto")
    .escape(),
  validFields,
];

module.exports.validationEditPurchaseDiscount = [
  param("id")
    .notEmpty()
    .withMessage("El ID es obligatorio")
    .isInt()
    .withMessage("El ID debe ser un número entero"),
  body("percentageDiscount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("El porcentaje de descuento debe ser un número entre 0 y 100"),
  body("quantityProducts")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  body("nameDiscount")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .escape(),
  validFields,
];

// PURCHASE VALIDATION
module.exports.validationCreatePurchase = [
  body("productItemid")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  body("providerId")
    .notEmpty()
    .withMessage("El proveedor es obligatorio")
    .isInt()
    .withMessage("El proveedor debe ser un entero"),
  body("duration")
    .notEmpty()
    .withMessage("La duración es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La duración debe ser un número entero positivo"),
  body("amount")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número positivo"),
  body("renewalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio de renovación debe ser un número positivo"),
  ,
  validFields,
];

module.exports.validationSendSupport = [
  param("id")
    .notEmpty()
    .withMessage("El ID es obligatorio")
    .isInt()
    .withMessage("El ID debe ser un número entero"),
  body("descriptionProblem")
    .optional()
    .isString()
    .withMessage("La descripción del problema debe ser texto"),
  validFields,
];

module.exports.validationSolveSupport = [
  param("id")
    .notEmpty()
    .withMessage("El ID es obligatorio")
    .isInt()
    .withMessage("El ID debe ser un número entero"),
  body("note")
    .optional()
    .isString()
    .withMessage("La descripción de la solución debe ser texto"),
  validFields,
];

module.exports.validationAccepRenewal = [
  body("purchaseIds")
    .optional()
    .isArray()
    .withMessage("La lista de compras es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La lista de compras debe ser un número entero"),
  validFields,
];

module.exports.validationRequestRefund = [
  param("id")
    .notEmpty()
    .withMessage("El ID es obligatorio")
    .isInt()
    .withMessage("El ID debe ser un número entero"),
  body("descriptionProblem")
    .optional()
    .isString()
    .withMessage("La descripción del problema debe ser texto"),
  validFields,
];

// RATING VALIDATION
module.exports.validationCreateRating = [
  body("productId")
    .notEmpty()
    .withMessage("El producto es obligatorio")
    .isInt()
    .withMessage("El producto debe ser un entero"),
  body("rating")
    .notEmpty()
    .withMessage("La calificación es obligatoria")
    .isInt({ min: 1, max: 5 })
    .withMessage("La calificación debe ser un número entre 1 y 5"),
  validFields,
];

// REFERRALS VALIDATION
module.exports.validationCreateReferral = [
  body("referralUserId")
    .notEmpty()
    .withMessage("El usuario es obligatorio")
    .isInt()
    .withMessage("El usuario debe ser un entero"),
  validFields,
];

// WALLET VALIDATION
module.exports.validationRecharge = [
  body("quantity")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  validFields,
];

module.exports.validationCreateRefund = [
  //   const { quantity, description, userId, providerId, productItemId, adminId } =req.body;
  body("quantity")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número positivo"),
  body("description")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto"),
  body("userId")
    .optional()
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero"),
  body("providerId")
    .optional()
    .isInt()
    .withMessage("El ID del proveedor debe ser un número entero"),
  body("productItemId")
    .optional()
    .isInt()
    .withMessage("El ID del producto debe ser un número entero"),
  body("adminId")
    .optional()
    .isInt()
    .withMessage("El ID del administrador debe ser un número entero"),
  validFields,
];
