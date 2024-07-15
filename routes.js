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
    console.log(req.body.popular)
    console.log(req.body.deal)

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
            deal: req.body.deal,
            popular: req.body.popular,
        }

        let collection = db.collection('gdvsta-store')
        await collection.insertOne(newProduct)

    }catch(err){
        console.log(err)
    }

    res.status(200).json('new item added successfully')
})

//update product 
router.patch('/auth/admin-update/', async(req,res)=>{
    try{                    
        const query ={_id: new ObjectId(req.body.id)}
        const updates ={
            $set:{
                name:req.body.name,
                brand:req.body.brand,
                price:req.body.price,
                discount:req.body.discount,
                primaryCategory:req.body.category,
                imageUrl:req.body.imglnk,
                description:req.body.description,
                deal: req.body.deal,
                popular: req.body.popular,
            }
        }
        let collection = await db.collection('gdvsta-store')
        let result = await collection.updateOne(query,updates)
        res.send(result).status(200);
    }catch(err){
        console.log(err)
    }
})


// experimental endpoint

router.get('/store', async (req,res)=>{

   const page = (req.query.page-1)*1 || 0; 
   const limit = req.query.rows*1 || 10;
   const skip = page*limit; 
   const category = req.query.category;
   
try{ 
    const collection = db.collection('gdvsta-store')
    if(category){


    
    const items = await collection.aggregate([
        { "$facet": {
        "totalData": [
            { "$match": {primaryCategory: {$regex: category} }}, 
            {"$sort":{date:-1}},
            { "$skip": skip },
            {"$limit": 10},
            
        ],
        "totalCount": [
            { "$match": { primaryCategory: { $regex: category } } },
            { "$count": "count" }
        ]
        }}
    ]).toArray() 

    res.status(200).json(items)
    }
    else if (!category){
        
    const items = await collection.aggregate([
        { "$facet": {
        "totalData": [
            { "$match": { }}, 
            {"$sort":{date:-1}},
            { "$skip": skip },
            {"$limit": 10},
            /*     
            { "$limit": limit },
            {"$sort": {date: -1}}*/
            
        ],
        "totalCount": [
            { "$count": "count" }
        ]
        }}
    ]).toArray() 

    res.status(200).json(items)
    }
}catch(err){
    console.log(err) 
} 

})



//get store
/*router.get ('/store', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-store')
        const items = await collection.find({}).sort({date:-1}).toArray()
        res.status(200).send(items)
    }catch(err){console.log(err)}

})*/

//get single item page
router.get('/products/:id', async (req,res)=>{
  
    
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

//delete product
router.delete('/auth/admin-delete/:id', async(req,res)=>{
    try{
        const query = {_id: new ObjectId(req.params.id)}
        const collection = db.collection('gdvsta-store')
        let result = await collection.deleteOne(query);
        res.send(result).status(200)
    }catch(err){
        console.log(err)
    }
})

//get popular items
router.get ('/products', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-store')
        const popularItems =  await collection.find({popular:true}).toArray()
        res.status(200).send(popularItems)
        
    } catch(err){console.log(err)}
})


//get deals
router.get ('/deals', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-store')
        const deals =  await collection.find({deal:true}).toArray()
        res.status(200).send(deals)
        
    } catch(err){console.log(err)}
})

 

export default router; 