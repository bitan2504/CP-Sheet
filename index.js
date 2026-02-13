// configuring environment variables
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// importing dependencies
const express = require("express");
const ejs = require("ejs");

// creating and configuring express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/sheet", (req, res) => {
    res.render("sheet", {
        name: "My CP Sheet", title: "My CP Sheet", problems: [
            {
                link: "https://codeforces.com/problemset/problem/1/A",
                name: "Theatre Square",
                tags: ["implementation", "math"]
            },
            {
                link: "https://leetcode.com/problems/two-sum/",
                name: "Two Sum",
                tags: ["array", "hashmap"]
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});