const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secrete = process.env.WEBTOKEN;
const fetchuser = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, jwt_secrete);
        req.user = data.user;
        next();

    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });

    }
}
module.exports = fetchuser;