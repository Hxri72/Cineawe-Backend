const ownerModel = require("../models/ownerModel");
const bcrypt = require('bcryptjs');
const { toast } = require("react-toastify");
const jwt = require('jsonwebtoken');
const theaterModel = require("../models/theaterModel");
const { findOne } = require("../models/ownerModel");

module.exports = {

    //get theaters
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

    getTheaterDetails:async(req,res,next)=>{
        try {
            const theaterId = req.body.theaterId
            const theaterDetails = await theaterModel.findOne({_id:theaterId})
            if(theaterDetails){
                return res.send({
                    success:true,
                    messae:'Theater Data fetched successfully',
                    data:theaterDetails
                })
            }
        } catch (error) {
            return error.response
        }
    },

    getShowDetails:async(req,res,next)=>{
        try {
            const showDetails = await theaterModel.findOne({_id:req.body.theaterId})
            if(showDetails){
                return res.send({
                    success:true,
                    message:'showdetails fetched successfully',
                    data:showDetails.shows
                })
            }else{
                return res.send({
                    success:false,
                    message:'showDetails not fetched'
                })
            }
        } catch (error) {
            console.log(error.message)
        }
    },

    postEditTheater:async(req,res,next)=>{
        try {
            const theaterId = req.body.theaterId
            const theaterData = req.body
            const theaterDetails = await theaterModel.find({_id:theaterId})
            if(theaterDetails){
                await theaterModel.updateOne({_id:theaterId},{
                    $set:{
                        theaterName:theaterData.theatername,
                        address:theaterData.address,
                        phone:theaterData.phone,
                        totalSeats:theaterData.totalseats
                    }
                })

                res.send({
                    success:true,
                    message:'Theater data updated successfully'
                })
            }else{
                res.send({
                    success:false,
                    message:'Theater data not updated'
                })
            }           
        } catch (error) {
            console.log(error.message)
        }
    },

    postDeleteTheater:async(req,res,next)=>{
        try {
            const theaterId = req.body.theaterId
            const theaterData = await theaterModel.findOne({_id:theaterId})
            if(theaterData){
               if(theaterData.shows.length===0){
                    await theaterModel.deleteOne({_id:theaterId})
                    const theatersData = await theaterModel.find({})
                    res.send({
                        success:true,
                        message:'Theater Deleted successfully',
                        data:theatersData
                    })
               }else{
                res.send({
                    success:false,
                    message:'Theater cannot be deleted. Theater have shows'
                })
               }
            }else{
                res.send({
                    success:false,
                    message:'Theater Data not fetched'
                })
            }

        } catch (error) {
            res.send({
                success:false,
                message:error.message
            })
        }
    },

    postDeleteShow:async(req,res,next)=>{
        try {
           
            const theaterName = req.body.theaterName
            const showId = req.body.showId 
            const theaterExist = await theaterModel.findOne({theaterName:theaterName})
            
            if(theaterExist){
                await theaterModel.updateOne({theaterName:theaterName},
                    {$pull:{
                        shows:{_id:showId}
                    }}
                )
                const theaterData = await theaterModel.findOne({theaterName:theaterName})
                console.log(theaterData)
                res.send({
                    success:true,
                    message:'Show deleted successfully',
                    data:theaterData
                })

            }else{
                res.send({
                    success:false,
                    message:'Something went wrong'
                })
            }

        } catch (error) {
            console.log(error.message)
        }
    },

    //add theaters
    postAddtheater: async(req,res,next)=>{
        try {
            const theaterExist = await theaterModel.findOne({theaterName:req.body.theaterName})
            if(theaterExist===null){
                const newTheater = new theaterModel(req.body)
                await newTheater.save();

                res.send({
                    success:true,
                    message:'Theater added successfully'
                })
            }else{
                res.send({
                    success:false,
                    message:'Theater already exist'
                })
            }

        } catch (error) {
            console.log(error.message)
        }
    },

    //Theater owner signup
    postOwnerSignup: async(req,res,next)=>{
        try {
            
            const ownerExist = await ownerModel.findOne({email:req.body.email})
            
            if(ownerExist){
                return res.send({
                    success:false,
                    message:'Owner already Exist'   
                })
            }
    
            //hashing the password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashPassword;
    
            const newUser = new ownerModel(req.body)
            await newUser.save();
    
            res.send({
                success:true,
                message:'Owner data saved successfully'
            })
        } catch (error) {
    
            console.log(error.message)
        }
        
    
    },
    //Theater owner Login
    postOwnerLogin:async(req,res,next)=>{
       
        const owner = await ownerModel.findOne({email:req.body.email})
        if(owner){
             const validatePassword = await bcrypt.compare(req.body.password,owner.password)
             if(validatePassword){
                //jwt token creation
                const token = jwt.sign({_id:owner._id},process.env.jwt_secret,{expiresIn:"1d"})
                if(owner.isAdminStatus==='Approved'){
                    res.send({
                        success:true,
                        message:'Owner logged in successfully',
                        data:token
                    })
                }else{
                    res.send({
                        success:false,
                        message:'Admin is not approved your account'
                    })
                }
             }else{
                res.send({
                    success:false,
                    message:'Password is incorrect'
                })
             }
        }else{
            res.send({
                success:false,
                message:'Owner is not exist'
            })
        }
    
    },

    postAddShows:async(req,res,next)=>{
        try {
            const showData = req.body.showData
        const date = showData.showdate

         // replace with your date string
        const parts = date.split("-");
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        console.log(formattedDate); 

        const theaterExist = await theaterModel.findOne({theaterName:showData.theatername})
        if(theaterExist){
            await theaterModel.updateOne({theaterName:showData.theatername},{
                $push:{
                    shows:{
                        theatername:showData.theatername,
                        showname:showData.showname,
                        moviename:showData.moviename,
                        ticketprice:showData.ticketprice,
                        showdate:formattedDate,
                        showtime:showData.showtime,
                        availableseats:showData.availableseats,
                        totalseats:showData.totalseats
                    }
                }
            })

            res.send({
                success:true,
                message:'New show added successfully'
            })
            
        }else{
            res.send({
                success:false,
                message:'Theater does not exist'
            })
        }
        } catch (error) {
            res.send({
                success:false,
                message:error.response
            })
        }
    }
}