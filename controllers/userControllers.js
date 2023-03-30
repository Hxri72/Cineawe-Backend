const user = require("../models/userModel");
const theaterModel = require('../models/theaterModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodeMailer = require("nodemailer");
const Razorpay = require('razorpay')
const crypto = require('crypto');
const bookingModel = require("../models/bookingModel");

module.exports = {

    getCurrentUser: async (req, res) => {
        try {
          const User = await user.findById(req.body.Id).select("-password");
          res.send({
            success: true,
            message: "User Details fetched successfully",
            data: User
          });
        } catch (error) {
          console.log(error.message);
        }
    },

    getShowDates:async(req,res)=>{
      try {
        const today = new Date();

        const lastweekDates = []
        for(let i=0;i<=6;i++){
          const date = new Date(today)
          date.setDate(today.getDate() + i);
          const day = date.getDate();
          const month = date.getMonth() + 1
          const year = date.getFullYear()
          const formattedDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
          lastweekDates.push(formattedDate)  
        }
       
        if(lastweekDates.length!==0){
          res.send({
            success:true,
            message:"Show date fetched successfully",
            data:lastweekDates
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
                  startdate: { $lte: date },
                  enddate: { $gte: date }
                }
              }
            }
          },
          {
            $project: {
              theaterName:1,
              shows: {
                $filter: {
                  input: "$shows",
                  as: "show",
                  cond: {
                    $and: [
                      { $eq: [ "$$show.moviename", movieName ] },
                      { $lte: [ "$$show.startdate", date ] },
                      { $gte: [ "$$show.enddate", date ] }
                    ]
                  }
                }
              }
            }
          }
        ])

        console.log(showData)
        
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
    },

    getTheater:async(req,res,next)=>{
      try {   
          const theaterName = req.body.theaterName
          const theater = await theaterModel.find({theaterName:theaterName})
          if(theater){
              res.send({
                  success:true,
                  message:'Theater Details Fetched successfully',
                  data:theater
              })
          }else{
              res.send({
                  success:false,
                  message:'Theater details not fetched'
              })
          }
      } catch (error) {
          console.log(error.message)
      }
  },

  getCreateOrder : async (req,res) => {
    try {
      const amount = req.body.amount
      var instance = new Razorpay({ key_id: process.env.Razorpay_KEY_ID, key_secret: process.env.Razorpay_Secret })
      const options = {
        amount: amount * 100,
        currency: 'INR',
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
          res.status(500).send('Something went wrong');
        }
        res.json(order);
      });
    } catch (error) {
      
      console.log(error.message)
    }
  },

  postVerifyPayment : async(req,res,next) => {
    try {
      const paymentDetails = req.body
      const paymentData = paymentDetails.paymentData

      const userDetails = paymentData.user
      const contactMail = paymentData.email
      const contactPhone = paymentData.phone
      const showData = paymentData.showData
      const selectedSeats = paymentData.selectedSeats
      const showDate = paymentData.showDate
      const price = paymentData.price
      const showId = showData._id

      const subTotal = selectedSeats.length * showData.ticketprice

      let hmac = crypto.createHmac('sha256',process.env.Razorpay_Secret)
      hmac.update(paymentDetails.payment.razorpay_order_id+'|'+ paymentDetails.payment.razorpay_payment_id);
      hmac = hmac.digest('hex')

      if(hmac === paymentDetails.payment.razorpay_signature){
        
        await bookingModel.insertMany({
            user : userDetails.firstname,
            userMail : userDetails.email,
            contactMail : contactMail,
            contactPhone : contactPhone,
            theaterName: showData.theatername,
            movieName : showData.moviename,
            showDate : showDate,
            showTime : showData.showtime,
            subTotal : subTotal,
            totalPrice : price,
            selectedSeats : selectedSeats
        })

        await theaterModel.updateOne({
            theaterName:showData.theatername,
            "shows._id": showId,
            "shows.seats.id": { $in: selectedSeats.map(seat => seat.id) }
          },
          { $set: { "shows.$[show].seats.$[seat].seatStatus": "sold" } },
          { arrayFilters: [
              { "show._id": showId },
              { "seat.id": { $in: selectedSeats.map(seat => seat.id) }}
            ]
        })

        res.send({
          success:true,
          message:'verification complete'
        })

      }else{
        res.send({
          success:false,
          message:'something went wrong'
        })
      }

    } catch (error) {
      console.log(error.message)
    }
  }
}