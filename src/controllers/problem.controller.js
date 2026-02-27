const Problem = require("../models/problem.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const addProblem = asyncHandler(async (req, res) => {
    const { name, link, tags } = req.body;

    if (!name || !link) {
        throw new ApiError(400, "Problem name and link are required");
    }

    const problem = await Problem.create({
        user: req.user._id,
        name,
        link,
        tags: tags || [],
    });

    return res.status(201).json(
        new ApiResponse(201, problem, "Problem added successfully")
    );
});

const getUserProblems = asyncHandler(async (req, res) => {
    const { favorites } = req.query;

    let query = { user: req.user._id };

    if (favorites === 'true') {
        query.isFavourite = true;
    }

    const problems = await Problem.find(query).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, problems, "User problems fetched successfully")
    );
});

const updateProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, link, tags } = req.body;

    let problem = await Problem.findOne({ _id: id, user: req.user._id });

    if (!problem) {
        throw new ApiError(404, "Problem not found or unauthorized");
    }

    if (name) problem.name = name;
    if (link) problem.link = link;
    if (tags) problem.tags = tags;

    await problem.save();

    return res.status(200).json(
        new ApiResponse(200, problem, "Problem updated successfully")
    );
});

const deleteProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findOneAndDelete({ _id: id, user: req.user._id });

    if (!problem) {
        throw new ApiError(404, "Problem not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Problem deleted successfully")
    );
});

const toggleFavourite = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findOne({ _id: id, user: req.user._id });

    if (!problem) {
        throw new ApiError(404, "Problem not found or unauthorized");
    }

    problem.isFavourite = !problem.isFavourite;
    await problem.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            problem,
            problem.isFavourite ? "Problem marked as favorite" : "Problem removed from favorites"
        )
    );
});

module.exports = {
    addProblem,
    getUserProblems,
    updateProblem,
    deleteProblem,
    toggleFavourite,
};
