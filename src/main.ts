import express from "express";
import afipControllers from "./controllers/afip.controller";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.API_PORT || 3002;

app.use(morgan("tiny"));
app.use("/api/afip", afipControllers);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
