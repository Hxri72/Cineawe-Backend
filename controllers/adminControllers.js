const admin = require('../models/adminModel')
const user = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ownerModel = require('../models/ownerModel')
const userModel = require('../models/userModel')
const nodeMailer = require("nodemailer");
const mongoose = require('mongoose')
const theaterModel = require('../models/theaterModel')
const bookingModel = require('../models/bookingModel')
const moviesModel = require('../models/movieModel')
const movieModel = require('../models/movieModel')

module.exports = {
    //user management
    getAdminUser:async(req,res)=> {

        const users = await user.find({})
        return res.send({
            success:true,
            message:'Userlist getted',
            data:users
        })
    },

    //owner management
    getAdminOwner:async(req,res)=>{
        const owners = await ownerModel.find({})
        return res.send({
            success:true,
            message:'Ownerlist fetched successfully',
            data:owners
        })
    },

    getTheaters: async(req,res,next)=>{
        try {
            const theaters = await theaterModel.find({})
            res.send({
                success:true,
                message:'Theaterlist fetched successfully',
                data:theaters
            })
            
        } catch (error) {
            console.log(error.message)
        }
    },
    getAllBooking : async (req,res,next) => {
        try {
            const bookings = await bookingModel.find({})
            if(bookings){
                res.send({
                    success:true,
                    message:'bookingData fetched succesfully',
                    data:bookings
                })
            }
          } catch (error) {
            console.log(error.response)
          }
    
    },

    postAddMovies:async(req,res) => {
        try {
            
            const movieName = req.body.movieDetails.title
            const movieId = req.body.movieDetails.id
            const movieLanguage = req.body.movieDetails.original_language

            const data = {
                movieName:movieName,
                movieId:movieId,
                movieLanguage:movieLanguage
            }

            const movieExist = await moviesModel.find({
                $or: [
                    { englishMovies: { $elemMatch: { movieName: movieName } } },
                    { malayalamMovies: { $elemMatch: { movieName: movieName } } },
                    { tamilMovies: { $elemMatch: { movieName: movieName} } }
                ]
            })

            

            const moviesExist = await moviesModel.find({})
            
            if(moviesExist.length === 0){
                if(movieLanguage === 'en'){
                    const movies = new moviesModel({
                        englishMovies : data
                    })
                    movies.save();
                }else if(movieLanguage === 'ml'){
                    const movies = new moviesModel({
                        malayalamMovies : data
                    })
                    movies.save()
                }else if(movieLanguage === 'ta'){
                    const movies = new moviesModel({
                        tamilMovies : data
                    })
                    movies.save()
                }
            }else{
                if(movieExist.length === 0){
                    if(movieLanguage === 'en'){
                        console.log('its');
                        await moviesModel.updateOne({
                            $push : {
                                englishMovies :data
                            }
                        })
                        
                    }else if(movieLanguage === 'ml'){
                        await moviesModel.updateOne({
                            $push:{
                                malayalamMovies : data
                            }
                        })
                    }else if(movieLanguage === 'ta'){
                        await moviesModel.updateOne({
                            $push : {
                                tamilMovies : data
                            }
                        })
                    }
                }else{
                    return res.send({
                        success:false,
                        message:'movie already added'
                    })
                }
                
            }

            res.send({
                success:true,
                message:'Movie added successfully'
            })

        } catch (error) {
            res.send({
                success:false,
                message:'data not stored'
            })

        }
    },

    getMovies : async(req,res)=> {
        try {
            const data = await moviesModel.find({})
            const wholeData = []
            
            for(let i=0;i<data[0].englishMovies.length;i++){
                wholeData.push(data[0].englishMovies[i])
            }

            for(let i=0;i<data[0].malayalamMovies.length;i++){
                wholeData.push(data[0].malayalamMovies[i])
            }

            for(let i=0;i<data[0].tamilMovies.length;i++){
                wholeData.push(data[0].tamilMovies[i])
            }
            
            res.send({
                success:true,
                message:'data fetched successfully',
                data:wholeData
            })
           
        } catch (error) {
            res.send({
                success:false,
                message:'data is not fetched'
            })
        }
    },

    //admin login
    postAdminLogin:async(req,res)=>{
        try {
            
            const adminExist = await admin.findOne({username:req.body.username})
            if(adminExist){
                const validPassword = await bcrypt.compare(
                    req.body.password , adminExist.password
                )
                if(validPassword){
                    //create a jwt token
                    const token = jwt.sign({_id:req._id},process.env.jwt_secret,{expiresIn:"1d"})
    
                    return res.send({
                        success:true,
                        message:"Admin Logged in successfully",
                        data:token
                    })
                }else{
                    return res.send({
                        success:false,
                        message:"Password is incorrect"
                    })
                }
            }else{
                return res.send({
                    success:false,
                    message:'Username is incorrect'
                })
            }
            
            
        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    },

    postAdminCreate:async(req,res)=>{
        try {
            const adminExist = await admin.findOne({email:req.body.email})
            if(adminExist){
               return res.send({
                success:false,
                message:'User already Exist'
               })
            }
            
            //hashing the password
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(req.body.password,salt)
            req.body.password = hashPassword
    
            const newUser = new admin(req.body)
            await newUser.save()
    
            res.send({
                success:true,
                message:"User created successfully"
            })
        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    },
    postBlockUser: async(req,res,next)=>{
        try {
            const userId = req.body.userId
            const user = await userModel.findOne({_id:userId})
            if(user){
                await userModel.updateOne({_id:mongoose.Types.ObjectId(userId)},
                {$set:{
                    isAdminBlocked: 'true'
                }}    
                )
            }
            const usersData = await userModel.find({})
            res.send({
                success:true,
                message:'User blocked Successfully',
                data:usersData
            })

        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    },

    postUnblockUser:async(req,res)=>{
        try {
            const userId = req.body.userId
            const user = await userModel.findOne({_id:userId})
            
            if(user){
                await userModel.updateOne({_id:mongoose.Types.ObjectId(userId)},
                {$set:{
                    isAdminBlocked: 'false'
                }}    
                )
            }

            const userData = await userModel.find({})
            res.send({
                success:true,
                message:'User unblocked successfully',
                data:userData
            })

        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    },

    postOwnerStatusChange:async(req,res,next)=>{
        try {
            
            const ownerStatus = req.body.ownerStatus
            const ownerId = req.body.ownerId

            const owner = await ownerModel.findOne({_id:ownerId})

            if(ownerStatus==='Approved'){
                await ownerModel.findOneAndUpdate({_id:ownerId},{
                    $set:{
                        isAdminStatus:"Approved"
                    }
                }) 
                console.log('Mail sending')
                const ownerMail = owner.email;
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
                    to: ownerMail,
                    subject: "Account Approved",
                    text: `Your account has been approved. As a verified theater owner, you can now add movies and shows to our platform. Please familiarize yourself with the tools and features available. Contact us if you have any questions. Thank you for choosing to partner with us.`,
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

                res.send({
                    success:true,
                    message:'Status Changed Successfully'
                })
            }else if(ownerStatus === 'Blocked'){
                await ownerModel.findOneAndUpdate({_id:ownerId},{
                    $set:{
                        isAdminStatus:'Blocked'
                    }
                })
                res.send({
                    success:true,
                    message:'owner is blocked successfully'
                })
            }else{
                res.send({
                    success:false,
                    message:'something went wrong'
                })
            }
        } catch (error) {
            res.send({
                success:true,
                message:error.message
            })
        }
    },

    postDeleteMovie : async (req,res,next) => {
        try {
            const movieId = req.body.movieId
            await movieModel.updateMany({},{
                 $pull: { 
                    englishMovies: { 
                      movieId: { 
                        $in: [ movieId ] 
                      } 
                    },
                    malayalamMovies: { 
                      movieId: { 
                        $in: [ movieId ] 
                      } 
                    },
                    tamilMovies: { 
                      movieId: { 
                        $in: [ movieId ] 
                      } 
                    }
                  } 
            })

            const data = await moviesModel.find({})
            const wholeData = []
            
            for(let i=0;i<data[0].englishMovies.length;i++){
                wholeData.push(data[0].englishMovies[i])
            }

            for(let i=0;i<data[0].malayalamMovies.length;i++){
                wholeData.push(data[0].malayalamMovies[i])
            }

            for(let i=0;i<data[0].tamilMovies.length;i++){
                wholeData.push(data[0].tamilMovies[i])
            }

            res.send({
                success:true,
                message:'Movie deleted successfully',
                data:wholeData
            })
        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    }
   
}