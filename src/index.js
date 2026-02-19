// configuring environment variables
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// importing dependencies

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
app.get("/sheet", (req, res) => {
    res.render("sheet", {
        name: "My CP Sheet",
        title: "My CP Sheet"
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;