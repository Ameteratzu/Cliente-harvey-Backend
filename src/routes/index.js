const express = require("express");
const userRoutes = require("./user.routes.js");
const codeRegisterRouter = require("./code-register.routes");
const providerRouter = require("./provider.routes.js");
const adminRouter = require("./admin.routes.js");
const categoryRouter = require("./category.routes");
const productRouter = require("./product.routes");
const productItemRouter = require("./product-item.routes");
const walletRouter = require("./wallet.routes");
const purchasesRouter = require("./purchases.routes");

const router = express.Router();

router.use("/code-register", codeRegisterRouter);
router.use("/users", userRoutes);
router.use("/providers", providerRouter);
router.use("/admins", adminRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/product-item", productItemRouter);
router.use("/wallet", walletRouter);
router.use("/purchases", purchasesRouter);

module.exports = router;
