const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;
const URL = process.env.MONGODB_URL;
mongoose.connect(URL).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error:" + err)
})
app.use("/api/auth", require("./route/router"));
app.use("/api/social", require('./route/Social'));
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})