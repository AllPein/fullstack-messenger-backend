const router = require("express-promise-router")();
const express = require("express");
const passport = require("passport");
const passportConf = require("../passport");


const { validateBody, schemas } = require("../helpers/routeHelpers");
const UserController = require("../controllers/users");

router.route("/register")
.post(UserController.signUp);

router.route("/login")
.post(validateBody(schemas.authSchema), passport.authenticate("local", { session: false }), UserController.signIn);

router.route("/userinfo")
.get(passport.authenticate("jwt", { session: false }), UserController.getInfo);


module.exports = router;