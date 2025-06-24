const AppError = require("../utils/appError.js"); // Ajusta la ruta según tu estructura

const errorHandler = (err, req, res, next) => {
  console.log({ error: "error israel" });
  console.log("🔍 Error recibido en errorHandler:");
  console.log("➡️ Nombre:", err.name);
  console.log(
    "➡️ Es instancia de AppError:",
    err instanceof require("../utils/appError")
  );
  console.log("➡️ isOperational:", err.isOperational);
  console.log("➡️ Código:", err.statusCode);

  // Si es un AppError operacional, usar su statusCode
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Para errores de Sequelize/base de datos
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    return res.status(400).json({
      status: "error",
      message: `Validation Error: ${message}`,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0].path;
    return res.status(409).json({
      status: "error",
      message: `${field} ya existe`,
    });
  }

  // Error genérico 500
  console.error("ERROR 💥:", err);
  res.status(500).json({
    status: "error",
    message: "Algo salió mal en el servidor",
  });
};

module.exports = errorHandler;
