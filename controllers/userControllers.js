const user = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodeMailer = require("nodemailer");

module.exports = {

    getCurrentUser: async (req, res) => {
        try {
          const User = await user.findById(req.body.userId).select("-password");
          res.send({
            success: true,
            message: "User Details fetched successfully",
            data: User,
          });
        } catch (error) {
          console.log(error.message);
        }
    },

    postUserSignup:async(req,res,next)=>{
        try {
            const userExist = await user.findOne({ email: req.body.email });
            if (userExist) {
              return res.send({
                success: false,
                message: "User already Exist",
              });
            }
        
            //hashing the password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashPassword;
        
            const newUser = new user(req.body);
            await newUser.save(); 
        
            res.send({
              success: true,
              message: "User created successfully",
            });
          } catch (error) {
            res.send({
              success: false,
              message: error.message,
            });
          }
    },

    postUserLogin:async (req, res,next) => {
        try {
          //check if user exist
          const userExist = await user.findOne({ email: req.body.email });
      
          if (!userExist) {
            return res.send({
              success: false,
              message: "User does not exist",
            });
          }
      
          //checking password
          const validPassword = await bcrypt.compare(
            req.body.password,
            userExist.password
          );
      
          if (!validPassword) {
            return res.send({
              success: false,
              message: "Password is incorrect",
            });
          }
      
          //create and assign to token
          const token = jwt.sign({ _id: userExist._id }, process.env.jwt_secret, {
            expiresIn: "1d",
          });
          const {password,...others}=userExist._doc
      
          res.send({
            success: true,
            message: " User logged in Successfully",
            data: token,
            userData:others
          });
        } catch (error) {
          res.send({
            success: false,
            message: error.message,
          });
        }
    },

    postUserOtp:async (req, res,next) => {
        try {
          const otp = otpGenerator.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
          });
          console.log(otp);
      
          const sender = nodeMailer.createTransport({
            service: "gmail",
            auth: {
              user: "hariprasad727272@gmail.com",
              pass: process.env.APP_PASSWORD,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });
      
          const mailOptions = {
            from: "Cineawe",
            to: "hariprasad72172@gmail.com",
            subject: "Cineawe:- Verify with OTP",
            text: `OTP to verify : ${otp}`,
          };
      
          sender.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              res.send({
                success: true,
                message: "Email send successfully",
                data: otp,
              });
            }
          });
        } catch (error) {
          res.send({
            success: false,
            message: error.message,
          });
        }
    }
}