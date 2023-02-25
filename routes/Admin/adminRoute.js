const router = require('express').Router()
const admin = require('../../models/adminModel')
const user = require('../../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { response } = require('express')
const ownerModel = require('../../models/ownerModel')

//create a user
router.post('/admincreate',async(req,res)=>{
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
})


router.post('/adminlogin',async(req,res)=>{
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
})

router.get('/adminuser',async(req,res)=> {

    const users = await user.find({})
    return res.send({
        success:true,
        message:'Userlist getted',
        data:users
    })
})

router.get('/adminowner',async(req,res)=>{
    const owners = await ownerModel.find({})
    return res.send({
        success:true,
        message:'Ownerlist fetched successfully',
        data:owners
    })
})

module.exports = router