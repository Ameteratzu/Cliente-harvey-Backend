const RegistrationCodesService = require("./../services/code-register.service.js");
const catchAsync = require("../utils/catchAsync.js");
const db = require("../database/models/index.js");

const registrationCodesService = new RegistrationCodesService();

exports.createCodeRegister = catchAsync(async (req, res) => {
  const { roleType } = req.body;

  try {
    const generatedCode = require("uuid").v4();

    const newCodeRegister = await registrationCodesService.createCodeRegister({
      code: generatedCode,
      roleType,
    });

    return res.status(201).json(newCodeRegister);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

exports.getAllCodeRegisters = catchAsync(async (req, res) => {
  try {
    const allCodeRegisters =
      await registrationCodesService.getAllCodeRegisters();

    return res
      .status(200)
      .json({ allCodeRegisters, result: allCodeRegisters.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

exports.deleteCodeRegister = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    await registrationCodesService.deleteCodeRegister(id);

    return res.status(200).json({ message: "Código eliminado con éxito" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
