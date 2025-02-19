import express from "express";
import { addInquiry, deleteInquiry, getInquiry, updateInquiry } from "../controllers/inquiryController.js";

const inquiryRouter = express.Router();

inquiryRouter.post("/",addInquiry);
inquiryRouter.get("/",getInquiry);
inquiryRouter.delete("/:id",deleteInquiry);
inquiryRouter.put("/:id",updateInquiry);

export default inquiryRouter;