const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const {loginSchema,resetPasswordSchema} = require('../utils/userValidation');
const User = require('../model/adminAuthModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const AdminSignUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    logger.warn('Validation failed: Email or password missing');
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Validate the entire request body (email, password)
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    logger.warn(`Validation failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`SignUp failed: User with email ${email} already exists`);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password manually before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance with the hashed password
    user = new User({
      username,
      email,
      password: hashedPassword, // Save the hashed password
    });

    // Save the user to the database
    await user.save();

    logger.info(`New user registered: ${email}`);

    // Send success response
    return res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    logger.error(`Server error during registration: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


const AdminSignin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check for missing fields
      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Email and password are required.',
        });
      }
  
      // Validate input
      const { error } = loginSchema.validate({ email,password });
      if (error) {
        return res.status(400).json({
          error: true,
          message: error.message || 'Validation failed.',
        });
      }
      
      // Find the admin in the database
      const admin = await User.findOne({ email });
      if (!admin) {
        return res.status(401).json({
          error: true,
          message: 'Invalid email or password.',
        });
      }
  
      // Compare password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: true,
          message: 'Invalid email or password.',
        });
      }
  
      
  
      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id }, // Include necessary payload
        process.env.JWT_SECRET, 
        { expiresIn: '5h'} // Token expiration time
      );
  
      // SET TOEKN INTO COOKIES
      res.cookie('Authorization', `Bearer ${token}`, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', 
                    sameSite: 'strict',
                    expires: new Date(Date.now() + 8 * 3600000), 
                });
  
      res.status(200).json({
        error: false,
        message: 'Sign-in successful.',
        token,
      });
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message || 'Internal server error.',
      });
    }
  };
  
  const AdminSignout = async(req,res)=>{
    try{
    res.clearCookie('Authorization')
    res.status(200).json({success:true,message:"Log Out Successflluy"})
    }catch(error){
      res.status(500).json({error:true,message:error.message});
  
    }
  }



  const forgotPassword =  async (req, res,next) => {
    const { email } = req.body;
   

    try {
      
        // 1. Check if the user exists
        const user = await User.findOne({ email });

       

        if (!user) {
           res.status(400).json({error:true,message:"user not found"});
        }

        // 2. Generate verification code (6 digits)
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

        console.log('generated code :' + verificationCode);
        // 3. Hash the code and set expiration (e.g., 10 minutes)
        user.passwordResetToken = crypto.createHash('sha256').update(verificationCode).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // 4. Save user with the token and expiration time
        await user.save({ validateBeforeSave: false });

        // 5. Send email with the verification code
        const message = `Your password reset verification code is: ${verificationCode}. It is valid for 10 minutes.`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Verification Code',
            message,
        });

        res.status(200).json({
            status: true,
            message: 'Verification code sent to email',
            code: verificationCode
        });
    } catch (err) {
        res.status(500).json({error:true,message:err.message || "server error"})
    }
};


const verifyOTP = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`OTP Verification Failed: No user found with email ${email}`);
      return res.status(404).json({ error: true, message: 'No user found with that email' });
    }

    // Hash the verification code
    const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex');

    // Check if OTP is valid and not expired
    if (hashedCode !== user.passwordResetToken || Date.now() > user.passwordResetExpires) {
      logger.warn(`OTP Verification Failed: Invalid or expired OTP for email ${email}`);
      return res.status(400).json({ error: true, message: 'Verification code is invalid or has expired' });
    }

    // OTP is valid, respond with success
    logger.info(`OTP verified successfully for email ${email}`);
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    logger.error(`OTP Verification Error: ${error.message}`);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};


const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // Validate request data using Joi
  const { error } = resetPasswordSchema.validate({ newPassword, confirmPassword });
  if (error) {
    logger.warn(`Password Reset Validation Failed: ${error.message}`);
    return res.status(400).json({ error: true, message: error.message || 'Validation error' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Password Reset Failed: No user found with email ${email}`);
      return res.status(404).json({ error: true, message: 'No user found with that email' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear password reset token & expiration
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    logger.info(`Password reset successfully for email ${email}`);
    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    logger.error(`Password Reset Error: ${error.message}`);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};






module.exports = { AdminSignUp ,AdminSignin,AdminSignout,forgotPassword,verifyOTP,resetPassword };
