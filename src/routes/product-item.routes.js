const express = require("express");
const { createProductItem } = require("../controller/product-item.controller");

const productItemRouter = express.Router();

productItemRouter.post("/", createProductItem);

module.exports = productItemRouter;
