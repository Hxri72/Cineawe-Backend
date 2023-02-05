const router = require('express').Router()
const user = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//signup a new user
router.post('/signup',async (req,res) =>{
    try {

        const userExist = await user.findOne({email:req.body.email})
        if(userExist){
           return res.send({
            success:false,
            message:'User already Exist'
           })
        }
        
        //hashing the password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password,salt)
        req.body.password = hashPassword

        const newUser = new user(req.body)
        await newUser.save()

        res.send({
            success:true,
            message:"User created successfully"
        })

    } catch (error) {
        res.send ({
            success: false,
            message:error.message,
        })
    }
})

router.post('/login',async (req,res)=>{
    try {

        //check if user exist
        const user = await user.findOne({ email:req.body.email})

        if(!user){
            return res.send({
                success:false,
                message:"User does not exist"
            })
        }

        //checking password
        const validPassword = await bcrypt.compare(
            req.body.password,user.password
        )

        if(!validPassword){
            return res.send({
                success:false,
                message:"Password is incorrect"
            })
        }

        //create and assign a token
        const token = jwt.sign({userId:req._id},process.env.jwt_secret,{expiresIn:"1d"})
        
        res.send({success:true,message:" User logged in Successfully", data:token})

    } catch (error) {
        res.send({
            success:false,
            message:error.message,
        })
    }
})

module.exports = router