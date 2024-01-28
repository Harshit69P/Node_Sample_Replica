// const asyncHandler = require("express-async-handler");
const Model = require("../../../models/Index");
const User = Model.User;
const validate = require("../../validations/userValidationSchema");
const bcrypt = require("bcryptjs");
const constants = require("../../../common/constants")
const Auth = require("../../../common/authenticate");
const functions = require('../../../common/responses')

module.exports.registerUser = async (req, res, next) => {
    try {
        await validate.validateUser.validateAsync(req.body);
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new Error("All fields are mandatory!");
        }
        const userAvailable = await User.findOne({ email });
        if (userAvailable) {
            throw new Error("User already registered!")
        }
        //Hash password
        const hashPassword = await bcrypt.hash(password, 10);
        // console.log("hashed password: ", hashPassword);

        const user = await User.create({
            username,
            email,
            password: hashPassword
        });

        // console.log(`User created ${user}`);
        if (user) {
            console.log(`User created ${user}`);
            return res.json({ _id: user.id, email: user.email, message: "Register the user" });
        } else {
            throw new Error("User data is not valid");
        }
    } catch (error) {
        next(error);
    }
};


// module.exports.loginUser = (async (req, res, next) => {
//     try {
//         await validate.validateLogin.validateAsync(req.body)
//         const { email, password } = req.body;
//         if (!email || !password) {
//             throw new Error("All fields are mandatory!");
//         } else {
//             return res.json({ message: "Login successful!" });
//         }
//     } catch (error) {
//         next(error);
//     }
// });

// module.exports.loginUser = async (req, res, next) => {
//     try {
//         await validate.validateLogin.validateAsync(req.body);
//         const {email, password} = req.body;
//         if(!email || !password){
//             throw new Error("All fields are mandatory!");
//         }
//         const user = await User.findOne({email});
//         //compare password with hashed password
//         if(user && (await bcrypt.compare(password, user.password))){
//             const accessToken = await Auth.getToken({
//                 _id: user._id,
//                 role: "user",
//                 jti: user.jti,
//                 secretId: req.headers.deviceId
//             })
//             return res.json({accessToken});
//         } else{
//             throw new Error(constants.INVALID_CREDENTIALS);
//         }
//     } catch (error) {
//         next(error);
//     }
// };

module.exports.loginUser = async (req, res, next) => {
    try {
        await validate.validateLogin.validateAsync(req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("All fields are mandatory!");
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found!");
        }
        //compare password with hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error("Invalid password!");
        }
        const accessToken = await Auth.getToken({
            _id: user._id,
            role: "user",
            jti: user.jti,
            secretId: req.headers.deviceId
        });
        return res.json({ accessToken, message: "User logged in successfully" });
    } catch (error) {
        next(error);
    }
};


module.exports.getUser = async (req, res, next) => {
    try {
        await validate.validateId.validateAsync(req.params);
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error("User not found");
        }
        return res.json(user);
    } catch (error) {
        next(error);
    }
};

module.exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.json(users);
    } catch (error) {
        next(error);
    }
};


module.exports.updateUser = async (req, res, next) => {
    try {
        await validate.validateUpdate.validateAsync(req.body);
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error("User not found!");
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        return res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

module.exports.deleteUser = async (req, res, next) => {
    try {
        await validate.validateId.validateAsync(req.params);
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error("User not found!");
        }

        await User.deleteOne({ _id: req.params.id });

        return res.json({ message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
};