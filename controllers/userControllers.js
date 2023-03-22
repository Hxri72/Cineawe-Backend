const user = require("../models/userModel");
const theaterModel = require('../models/theaterModel')
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

    getShowDates:async(req,res)=>{
      try {
        const Dates = await theaterModel.aggregate([
          { $unwind: "$shows" },
          { $group: { _id: "$shows.showdate" } },
          { $project: { _id: 0, showdate: "$_id" } }
        ]);
       
        if(Dates){
          res.send({
            success:true,
            message:"Show date fetched successfully",
            data:Dates
          })
        }else{
          res.send({
            success:false,
            message:"Show date not fetched"
          })
        }

      } catch (error) {
        res.send({
          success:false,
          message:'Something went wrong'
        })
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

          if(userExist.isAdminBlocked==='true'){
            return res.send({
              success:false,
              message:"You are Blocked by Admin"
            })
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
    },
    
    postGetShows:async(req,res)=>{
      try {
        const date = req.body.data.date
        const movieName = req.body.data.movieName

        const showData = await theaterModel.aggregate([
          {
            $match: {
              shows: {
                $elemMatch: {
                  moviename: movieName,
                  showdate: date
                }
              }
            }
          },
          {
            $addFields: {
              shows: {
                $filter: {
                  input: "$shows",
                  as: "show",
                  cond: {
                    $and: [
                      { $eq: [ "$$show.moviename", movieName ] },
                      { $eq: [ "$$show.showdate", date ] }
                    ]
                  }
                }
              }
            }
          }
        ])
        
       res.send({
        success:true,
        message:'Show date fetched successfully',
        data:showData
       })
       
        
      } catch (error) {
        res.send({
          success:false,
          message:error.message
        })
      }
    }
}