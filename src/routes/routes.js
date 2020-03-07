const router = require("express-promise-router")();
const express = require("express");
const passport = require("passport");
const passportConf = require("../passport");


const { validateBody, schemas } = require("../helpers/routeHelpers");
const UserController = require("../controllers/users");
const DialogController = require('../controllers/dialogs');
const MessageController = require('../controllers/messages');


const createRoutes = (app, io) => {
    const DC = new DialogController(io);
    const MC = new MessageController(io);

    app.get('/messages/:id', MC.init);

    app.get('/dialogs/:id', DC.init);
    app.post('/dialogs', DC.create);

    app.post("/users/register", UserController.signUp);
    app.post("/users/login", validateBody(schemas.authSchema), passport.authenticate("local", { session: false }), UserController.signIn);
    app.get("/users/userinfo", passport.authenticate("jwt", { session: false }), UserController.getInfo);

}


module.exports = createRoutes;