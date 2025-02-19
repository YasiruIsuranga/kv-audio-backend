import express from 'express';
import { addProduct, deleteProduct, getProducts, updataProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",addProduct);
productRouter.get("/",getProducts);
productRouter.put("/:key",updataProduct);
productRouter.delete("/:key",deleteProduct);

export default productRouter;