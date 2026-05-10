import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from "./routes/user.route.js"
import recipeRouter from "./routes/recipe.route.js"
import shopinglistRouter from "./routes/shopinglist.route.js"
import gamificationRouter from "./routes/gamification.route.js"
import postRouter from "./routes/PostRoutes/image.route.js"
import commentRouter from "./routes/PostRoutes/comment.route.js";
import likeRouter from "./routes/PostRoutes/like.route.js";
import feedRouter from "./routes/feedRoute/feed.route.js";
import searchRouter from "./routes/search.routes.js"


app.use("/api/v1/users", userRouter)
app.use("/api/v1/recipes", recipeRouter)
app.use("/api/v1/shopinglists", shopinglistRouter)
app.use("/api/v1/gamifications", gamificationRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/feeds", feedRouter);
app.use("/api/v1/searches",searchRouter)


// ← error handler LAST
app.use((err, req, res, next) => {
  const statusCode = err.statuscode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
    data: null,
  });
});


export {app}