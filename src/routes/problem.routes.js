const express = require("express");
const {
    addProblem,
    getUserProblems,
    updateProblem,
    deleteProblem,
} = require("../controllers/problem.controller");
const verifyJWT = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(addProblem).get(getUserProblems);
router.route("/:id").put(updateProblem).delete(deleteProblem);

module.exports = router;
