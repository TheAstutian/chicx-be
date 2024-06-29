import express from 'express';
import bcrypt from 'bcryptjs';
import {BSON, ObjectId} from 'mongodb';

import db, {database} from './db.js'

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
            return res.status(401).json("Wrong username or password")
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

 

//add new product

router.post('/auth/admin-add', async (req,res)=>{
    console.log(req.body) 

    try{
        let newProduct={
            name:req.body.name,
            brand:req.body.brand,
            price:req.body.price,
            discount:req.body.discount,
            primaryCategory:req.body.category,
            imageUrl:req.body.imglnk,
            date:req.body.date,
            description:req.body.description,
        }

        let collection = db.collection('gdvsta-store')
        await collection.insertOne(newProduct)

    }catch(err){
        console.log(err)
    }

    res.status(200).json('new item added successfully')
})

//get store
router.get ('/store', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-store')
        const items = await collection.find({}).toArray()
        res.status(200).send(items)
    }catch(err){console.log(err)}

})

//get single item page

router.get('/products/:id', async (req,res)=>{
    if (req.params.id<35){
        res.status(200).json(database[req.params.id-1]) 
        return
    }
    
    try{
        const collection = db.collection('gdvsta-store')
        const idQuery = new ObjectId(req.params.id)
        const item = await collection.findOne({
            _id: idQuery
        })
        
     res.status(200).json(item) 

    }catch(err){
        console.log(err)
    }


})


export default router; 