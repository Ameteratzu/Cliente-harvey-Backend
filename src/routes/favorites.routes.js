const express = require("express");
const checkRole = require("../middlewares/chekRole");
const { verifySession } = require("../middlewares/verifySession");
const {
  addToFavorites,
  getMyFavorites,
  getFavoritesByUser,
  removeFromFavorites,
  removeFavorites,
} = require("../controller/favorites.controller");
const {
  validationAddToFavorite,
  validationParamId,
} = require("../middlewares/validateInputErrors");

const favoritesRouter = express.Router();

favoritesRouter.post(
  "/",
  verifySession,
  checkRole("user"),
  validationAddToFavorite,
  addToFavorites
);

favoritesRouter.get("/my", verifySession, checkRole("user"), getMyFavorites);

favoritesRouter.delete("/", verifySession, checkRole("user"), removeFavorites);

favoritesRouter.get(
  "/:id/user",
  verifySession,
  checkRole("admin"),
  validationParamId,
  getFavoritesByUser
);

favoritesRouter.delete(
  "/:id",
  verifySession,
  checkRole("user"),
  validationParamId,
  removeFromFavorites
);

module.exports = favoritesRouter;
