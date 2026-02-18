// configuring environment variables
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// importing dependencies
const fs = require("fs");
const path = require("path");
const express = require("express");
const ejs = require("ejs");

// creating and configuring express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
    res.render("index");
});

// Sheet route
const dataFilePath = path.join(__dirname, "..", "data", "problems.json");

const getProblems = () => {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return [];
        }
        const data = fs.readFileSync(dataFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data file:", err);
        return [];
    }
};

const saveProblem = (problem) => {
    try {
        const problems = getProblems();
        problems.push(problem);
        fs.writeFileSync(dataFilePath, JSON.stringify(problems, null, 2));
    } catch (err) {
        console.error("Error writing data file:", err);
    }
};

app.get("/sheet", (req, res) => {
    const problems = getProblems();
    res.render("sheet", {
        name: "My CP Sheet",
        title: "My CP Sheet",
        problems: problems
    });
});

app.post("/add-problem", (req, res) => {
    const { name, link, tags } = req.body;
    const newProblem = {
        name,
        link,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(tag => tag.trim()) : [])
    };
    saveProblem(newProblem);
    res.status(200).send("Problem added successfully");
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;