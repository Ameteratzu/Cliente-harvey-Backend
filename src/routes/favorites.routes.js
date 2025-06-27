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

const favoritesRouter = express.Router();

favoritesRouter.post("/", verifySession, checkRole("user"), addToFavorites);
favoritesRouter.get("/my", verifySession, checkRole("user"), getMyFavorites);
favoritesRouter.delete("/", verifySession, checkRole("user"), removeFavorites);
favoritesRouter.get(
  "/:id/user",
  verifySession,
  checkRole("admin"),
  getFavoritesByUser
);

favoritesRouter.delete(
  "/:id",
  verifySession,
  checkRole("user"),
  removeFromFavorites
);

module.exports = favoritesRouter;
