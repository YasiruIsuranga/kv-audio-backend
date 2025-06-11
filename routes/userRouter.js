import express from "express";
import loginWithGoogle, { getAllUsers, getUser, loginUser, registerUser, sendOTP, userBlockOrUnblock, verifyOTP } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",registerUser);

userRouter.post("/login",loginUser);

userRouter.get("/all",getAllUsers);

userRouter.put("/block/:email",userBlockOrUnblock);

userRouter.post("/google",loginWithGoogle);

userRouter.get("/sendOTP",sendOTP);

userRouter.post("/verifyEmail",verifyOTP);

userRouter.get("/", getUser);

export default userRouter;