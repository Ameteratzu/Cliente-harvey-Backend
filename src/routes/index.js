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
const cartRouter = require("./cart.route");
const referralsRouter = require("./referrals.routes");
const providerDiscountRouter = require("./provider-discount.route");
const publishedPruductsRouter = require("./published-products.routes");
const purchaseDiscountRouter = require("./purchase-discount.routes");
const favoritesRouter = require("./favorites.routes");
const ratingRouter = require("./rating.routes");
const productImagesRouter = require("./product-images.routes");
const authRouter = require("./auth.routes.js")

const router = express.Router();

router.use("/code-register", codeRegisterRouter);
router.use("/auth/", authRouter)
router.use("/users", userRoutes);
router.use("/providers", providerRouter);
router.use("/admins", adminRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/product-item", productItemRouter);
router.use("/wallet", walletRouter);
router.use("/purchases", purchasesRouter);
router.use("/cart", cartRouter);
router.use("/referrals", referralsRouter);
router.use("/provider-discount", providerDiscountRouter);
router.use("/published-products", publishedPruductsRouter);
router.use("/purchase-discount", purchaseDiscountRouter);
router.use("/favorites", favoritesRouter);
router.use("/rating", ratingRouter);
router.use("/product-images", productImagesRouter);

module.exports = router;
