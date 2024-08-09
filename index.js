const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

require("dotenv").config();

const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// connexion a mes services
// mongoose
mongoose.connect(process.env.MONGODB_URI);
// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

// dqskljhdklHDKLhdlkqhjs

app.use(express.json());

// salut

// import de mes routeurs
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
// cours 6
// const cours6Router = require("./routes/cours6");

// utilisation de mes routers
app.use("/user", userRouter); // le "/user" est un préfixe qui sera ajouté à toutes les routes de userRouter
app.use(offerRouter);
// app.use(cours6Router);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "all route",
  });
});

app.listen(process.env.PORT, () => {
  console.log("server started");
});
