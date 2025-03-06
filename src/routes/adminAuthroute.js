const express = require('express');
const { AdminSignUp, AdminSignin, AdminSignout, forgotPassword, resetPassword, verifyOTP } = require('../controller/adminAuthController');
const authMiddleware = require('../middleware/authMiddleware');

let Adminroute = express.Router();

Adminroute.route('/signup').post(AdminSignUp);
Adminroute.route('/signin').post(AdminSignin);
Adminroute.route('/signout').post(authMiddleware,AdminSignout);
Adminroute.route('/forgetpassword').post(forgotPassword);
Adminroute.route('/verify-otp').post(verifyOTP);
Adminroute.route('/reset-password').post(resetPassword);


module.exports = Adminroute ;
