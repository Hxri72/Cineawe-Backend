const router = require("express").Router();
const ownerModel = require("../../models/ownerModel");
const bcrypt = require('bcryptjs')


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



module.exports = router