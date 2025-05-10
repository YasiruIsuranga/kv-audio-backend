import express from "express";
import { getAllUsers, getUser, loginUser, registerUser, userBlockOrUnblock } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",registerUser);

userRouter.post("/login",loginUser);

userRouter.get("/all", getAllUsers);

userRouter.put("/block/:email", userBlockOrUnblock);

userRouter.get("/", getUser);

export default userRouter;