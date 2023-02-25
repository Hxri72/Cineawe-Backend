const router = require("express").Router();
const ownerModel = require("../../models/ownerModel");
const bcrypt = require('bcryptjs');
const { toast } = require("react-toastify");


router.post('/ownersignup',async(req,res)=>{
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
    

})

router.post('/owner',async(req,res)=>{
    const owner = await ownerModel.findOne({email:req.body.email})
    if(owner){
         const validatePassword = await bcrypt.compare(req.body.password,owner.password)
         if(validatePassword){
            if(owner.isAdminApprove==='true'){
                res.send({
                    success:true,
                    message:'Owner logged in successfully'
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

})



module.exports = router