import {
    logOut,
    loginUser,
    registerUser
}from "../../controller/auth.controllers.js"

import express from "express"

const router =express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logOut)

export default router