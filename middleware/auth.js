const jwt = require('jsonwebtoken');
const config = require('../config/config');


const veryfieToken = async (req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['authorization'];

        if (!token) return res.status(400).send({ success: false, auth: false, message: 'A token is requried to  Authentication ' });

        jwt.verify(token, config.secret, (err, decode) => {
            if (err) return res.status(400).send({ success: false, message: "Token is not valid please enter a valid Token" });
            console.log(decode);
            if (decode.userData.isAdmin == 0) {
                req.user = decode.userData
            } else {
                return res.status(400).send({ success: false, message: "You are Admin you have't permission to do that! " });
            }
        });
    } catch (error) {
        return res.status(400).send({ success: false, msg: error.message })
    }
    return next()
}


const isAdmin = async (req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['authorization'];

        if (!token) return res.status(400).send({ success: false, auth: false, message: 'A token is requried to  Authentication ' });

        jwt.verify(token, config.secret, (err, decode) => {
            if (err) return res.status(400).send({ success: false, message: "Token is not valid please enter a valid Token" });
            console.log(decode);
            if (decode.userData.isAdmin == 1) {
                req.admin = decode
            } else {
                res.status(400).send({ success: false, message: "You are not a Admin you have't permission to do that! " });
            }
        });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
    return next()
}


module.exports = { veryfieToken, isAdmin };