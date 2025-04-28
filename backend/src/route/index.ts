import { Application, Request, Response, NextFunction } from "express";
import authRouter from "./auth";
import expanseRouter from "./expanse";

const AppRoute = (app: Application) => {
  app.use("/expanse", expanseRouter);
  app.use("/auth", authRouter);

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
};

export default AppRoute;
