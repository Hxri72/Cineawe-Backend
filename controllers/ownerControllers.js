const ownerModel = require("../models/ownerModel");
const bcrypt = require('bcryptjs');
const { toast } = require("react-toastify");
const jwt = require('jsonwebtoken');
const theaterModel = require("../models/theaterModel");

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
    
    }
}