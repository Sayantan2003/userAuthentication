const express = require('express');
const app = express();
const userModel = require("./models/user");

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index");
});

app.post("/register", async (req, res) => {
    let { name, username, phonenum, email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) return res.status(500).send("User already registered!!");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username,
                name,
                phonenum,
                email,
                password: hash
            });

            let token = jwt.sign({ email: email, userid: user._id }, "Sayantan");
            res.cookie("token", token);
            res.redirect("/feed");
        });
    });
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(500).send("Somethong went wrong");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "Sayantan");
            res.cookie("token", token);
            res.status(200).redirect("/feed");
        }
        else res.redirect("/");
    });
});

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});

app.get("/feed", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("feed");
});

function isLoggedIn(req, res, next) {
    if (res.cookie.token === "") res.redirect("/");
    else {
        let data = jwt.verify(req.cookies.token, "Sayantan");
        req.user = data;
        next();
    }
}

app.listen(3000);