const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getToken } = require('../../utils');


const register = async (req, res, next) => {
    try {
        const payload = req.body;
        console.log(payload);


        let user = await User.create(payload);

        console.log(user);
        // await user.save();

        return res.json(user);
    } catch (err) {

        //* Kemungkinan eror karena Validasi
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        //* Error lainnya
        next(err);
    }
}


const localStrategy = async (email, password, done) => {
    try {
        let user = await User.findOne({ email }).select('-__v -createdAt -cart_items -token');
        console.log(email, password);
        if (!user) return done();
        if (bcrypt.compareSync(password, user.password)) {
            ({ password, ...userWithoutPassword } = user.toJSON());
            return done(null, userWithoutPassword);
        }
    } catch (err) {
        done(err, null);
    }
    done();
}

const login = async (req, res, next) => {
    passport.authenticate('local', async function (err, user) {
        if (err) return next(err);

        if (!user) return res.json({ error: 1, message: 'Email or Password incorect' });

        let signed = jwt.sign(user, config.secretkey);

        await User.findByIdAndUpdate(user._id, { $push: { token: signed } });

        res.json({
            message: 'Login Successfully',
            user,
            token: signed
        })
    })(req, res, next);
}

const logout = async (req, res, next) => {
    let token = getToken(req);

    let user = await User.findOneAndUpdate({ token: { $in: [token] } }, { $pull: { token: token } }, { useFindAndModify: false });

    if (!token || !user) {
        return res.json({
            error: 1,
            message: 'No User Found!!!'
        });
    }

    return res.json({
        error: 0,
        message: 'Logout Berhasil'
    });
}

const me = (req, res, next) => {
    if (!req.user) {
        res.json({
            error: 1,
            message: `You're not login or token expired`
        });
    }

    res.json(req.user);
}

module.exports = { register, login, localStrategy, logout, me };