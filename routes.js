import express from 'express';
import bcrypt from 'bcryptjs';
import {BSON, ObjectId} from 'mongodb';

import db from './db.js'

const router = express.Router();

//AUTH APIs
//admin register
router.post('/auth/admin-register', async(req,res)=>{
 const salt = bcrypt.genSaltSync(10);
 const passwordHash = bcrypt.hashSync(req.body.inputs.password, salt)
 try{
    let newDocument={
        email: req.body.inputs.email,
        password: passwordHash,
        type:"admin",
        clearance:"1"
    }
    let collection = db.collection('gdvsta-users')
    const userCheck = await collection.findOne({email:req.body.inputs.email})
    if(userCheck){
        
        return res.status(400).json("Error. User already exists")
    } else {
        await collection.insertOne(newDocument);
    
    return res.status(204).json("New user successfully created")}

 }catch(err){
    console.log(err)
 }
})

//admin login
router.post('/auth/admin-login', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-users')
        
        const checkUser = await collection.findOne({
            email: req.body.email
        })

        if(!checkUser){
            return res.status(401).json("User doesn't exist")
        }
        const validatePassowrd = await bcrypt.compare(req.body.password, checkUser.password)
        if(!validatePassowrd){
            return res.status(401).json("Invalid password")
        }
        const user={
            email: checkUser.email,
            type: checkUser.type,
            clearance:checkUser.clearance,  
        } 
        return res.status(200).json(user)
    }catch(err){
        console.error(err)
    }
})




export default router; 