const express = require("express");
const {
    addProblem,
    getUserProblems,
    updateProblem,
    deleteProblem,
    toggleFavourite,
} = require("../controllers/problem.controller");
const verifyJWT = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(addProblem).get(getUserProblems);
router.route("/:id").put(updateProblem).delete(deleteProblem);
router.route("/:id/toggle-favourite").patch(toggleFavourite);

module.exports = router;
