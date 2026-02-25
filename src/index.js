// configuring environment variables
require("dotenv").config();
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
const PORT = process.env.PORT || 3000;

// importing dependencies

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes/user.routes");
const oauthRoutes = require("./routes/oauth.routes");
const problemRoutes = require("./routes/problem.routes");
const viewAuth = require("./middlewares/viewAuth.middleware");

// creating and configuring express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cookieParser());
app.use(viewAuth);

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

app.get("/signup", (req, res) => {
    res.render("signup", { error: req.query.error });
});

app.get("/login", (req, res) => {
    res.render("login", { error: req.query.error });
});

const errorMiddleware = require("./middlewares/error.middleware");

// APIs
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/oauth", oauthRoutes);
app.use("/api/v1/problems", problemRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

const connectDB = require("./db/index");

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

module.exports = app;