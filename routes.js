import express from 'express';
import bcrypt from 'bcryptjs';
import {BSON, ObjectId} from 'mongodb';
import jsonwebtoken from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import axios from 'axios';


import db, {database} from './db.js'

const router = express.Router();



function randomId() {
    let finalNumberString;
  
    do {
      const randomPart = Math.floor(10000 + Math.random() * 90000);  
      // Take the last 8 digits of the current timestamp
      const timestampPart = Date.now().toString().slice(-8);
      finalNumberString = `${randomPart}${timestampPart}`;
  
    } while (finalNumberString.length !== 13);
    return finalNumberString;
  }

//AUTH APIs
//admin register
router.post('/auth/admin-register', async(req,res)=>{

    if(!req.body.inputs.email || !req.body.inputs.password){

        return res.status(400).json("Please enter username and/or password")
    }
    if(req.body.inputs.email==='' || req.body.inputs.password===''){
            return res.status(400).json("No information provided")
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(req.body.inputs.email)){
        return res.status(400).json("Invalid email ")
    }

    let collection = db.collection('gdvsta-users')
    const userCheck = await collection.findOne({email:req.body.inputs.email})
    if(userCheck){
        
        return res.status(400).json("Error. User already exists")
    } 

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(req.body.inputs.password, salt)
   

    const verificationToken = jsonwebtoken.sign(
        {email: req.body.inputs.email, hashedPassword: passwordHash},
        'secret',
        {expiresIn: '24h'}
    )
    const verificationLink = `http://${process.env.SERVER_URL}/verify/${req.body.inputs.email}/${verificationToken}`
    const apiKey = process.env.BREVO_API; 
    const url = process.env.BREVO_URL
    const emailData = {
        sender: { 
            name: 'Goldyvhista Hubz',
            email: 'cryptospeaks@gmail.com' 
        }, 
        to: [
            {email: req.body.inputs.email }
        ],
        subject: 'Goldyvhista Hubz -- Verify your email ', 
        htmlContent:  `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            
            <h2 style="color: #004643; border-bottom: 2px solid #004643; padding-bottom: 10px;">Goldyvhista Hubz</h2>
            
            <p style="font-size: 16px; color: #333333;">Hello <b> ${req.body.inputs.email}</b>,</p>
            
            <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                To complete your registration, please click the button below to verify your email address:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a 
                    href="${verificationLink}" 
                    style="
                        display: inline-block; 
                        padding: 12px 25px; 
                        background-color: #004643;  
                        color: #ffffff; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px;
                    "
                >
                    Verify Email
                </a>
            </div>
            
            <p style="font-size: 14px; color: #888888; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 25px;">
                If you did not request this, please ignore this email.
            </p>
            
            <p style="font-size: 14px; color: #888888;">Thank you for choosing Goldyvhista Hubz!</p>
            
        </div>`
        }  
    try{
        const response = await axios.post(url, emailData, {
            headers: {
                'Content-Type': 'application/json', 
                'api-key': apiKey
            }
        })
        if(response){
            res.status(200).json({
                message: "Email verification link sent!"
            })
        }
 
    }catch(err){
        console.log('error happeed', err)
    }


 try{
    
    let newDocument={
        email: req.body.inputs.email,
        password: passwordHash,
        verified: false, 
        registeredAt: Date.now(),
        token: verificationToken,
        tokenExpiry: Date.now() + 10800000
       // type:"user",
        // clearance:"0",
        // userid: Date.now()
    }
    console.log(newDocument)
   
        await collection.insertOne(newDocument); 
    
    return res.status(204).json("New user successfully created")

 }catch(err){
    console.log(err)
 } 
})

//email verification

router.get('/verify/:email/:token', async(req,res)=>{

  // <a href=`http://${process.env.WEB_URL}/Regconfirm?status=emailverified&email=${req.body.inputs.email}&token=${verificationToken}  
   

  
    try {
        const { email, token } = req.params;
        //console.log(email, token)

        // 1. Find the user in the database using the email and token.
        //    Make sure the token hasn't expired.
        let collection = await db.collection('gdvsta-users')
        const user = await collection.findOne({ email});

        if (!user) {
            return res.redirect(`http://${process.env.WEB_URL}/RegConfirm?status=noUser&username=${email}`);
        } 
            if (user.tokenExpiry&& user.tokenExpiry < Date.now()) { //token has expired
                return res.redirect(`http://${process.env.WEB_URL}/RegConfirm?status=tokenExpired&username=${email}`);
                ///Regconfirm?status=verifyemail&username=${inputs.email}`
                 
            } else if (user.tokenExpiry&& user.tokenExpiry>= Date.now()){ //token is yet to expire
                user.verified = true;
                user.token = undefined; // clear the token for security
                user.type= "user"
                user.clearance = '0'
                user.userId = randomId()

                await user.save();
              return  res.redirect(`http://${process.env.WEB_URL}/RegConfirm?status=emailverified&username=${email}`);
            } else {
                return  res.redirect(`http://${process.env.WEB_URL}/RegConfirm?status=verifyemail&username= `);
            }

       
      

        // 3. Redirect the user to a confirmation page.
        //    This is where you'd redirect to your front-end.
      
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during verification.');
    } 
})

router.post('/turnstile', async(req,res)=>{
    const {token} = await req.body

    const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const response = await fetch(verifyEndpoint, {
        method: 'POST',
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })

      const data = await response.json()
      if (data.success){
        res.status(200).json({
            data:data.success
        })
        return 
      }
      else {
        res.status(400).json({
            data: data.success
           })
      } 

})



// order setup

router.post('/order', async (req,res)=>{
    //console.log(req.body.order.cart)

    const orderObject = req.body.order 
    orderObject.ID = randomId()
    orderObject.timeStamp = Date.now()
    var d = new Date(Date.now());
//    const datetime = orderObject.dateStamp.toString()
    orderObject.date = (new Date(Date.now())).toString()
    const logoUrl = 'https://i.ibb.co/5x95NZ3J/GDVSTA.png'
    try {

        let collection = db.collection('gdvsta-orders')
      const addOrderToDB=  await collection.insertOne(orderObject)
      if (addOrderToDB){
        //send email to user 
        const apiKey = process.env.BREVO_API; 
        const url = process.env.BREVO_URL;

        const cartItemsHtml = orderObject.cart.map(item=>{
            return `
            <tr style="border-bottom: 1px solid #eee;">
            <td style="padding:10px; width:80px;">
            <img src="${item.imageUrl}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;"/>
            </td>
            <td style="padding: 10px; color: #333;">
            <strong>${item.name}</strong><br>
            <small>ID: ${item.productID}</small>
            </td>
            <td style="padding: 10px; text-align: center; color: #555;">
            ${item.quantity}
            </td>
            <td style="padding: 10px; text-align: right; color: #555;">
                    ₦${item.sellingPrice.toLocaleString()}
                </td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #111;">
                   ₦${(item.sellingPrice * item.quantity).toLocaleString()}
                </td>
            </tr>
            `
        }).join(''); 

        const emailData = {
            sender: {
                name: 'Goldyvhista Hubz',
                email: 'cryptospeaks@gmail.com' 
            }, 
            to: [
                {email: orderObject.userDetails.email }
            ],
            subject: 'Goldyvhista Hubz -- Verify your email ', 
            htmlContent: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            
            <div style="padding: 20px; text-align: center; background-color: #f8f8f8;">
                <img src="${logoUrl}" alt="Goldyvhista Hubz Logo" style="max-width: 180px; height: auto; border: 0;" />
            </div>
            
            <div style="padding: 20px;">
                <h1 style="color: #FFA500; font-size: 24px;">Order Confirmation</h1>
                <p style="font-size: 16px; color: #333;">
                    <b>${orderObject.userDetails.name}</b>, thank you for your order!
                </p>
                <p style="font-size: 14px; color: #555;">
                    We've received your order **#${orderObject.ID}** and will contact you as soon as your package is shipped. You can find details of your purchase below.
                </p>
                
                <h2 style="font-size: 18px; color: #333; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Summary</h2>
                <p style="font-size: 12px; color: #777; margin: 5px 0;">Order Date: ${orderObject.date}</p>
                <p style="font-size: 12px; color: #777; margin: 5px 0;">Order ID: ${orderObject.ID}</p>

                <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th colspan="2" style="padding: 10px; text-align: left; color: #333; font-size: 14px;">Product</th>
                            <th style="padding: 10px; text-align: center; color: #333; font-size: 14px;">Qty</th>
                            <th style="padding: 10px; text-align: right; color: #333; font-size: 14px;">Price</th>
                            <th style="padding: 10px; text-align: right; color: #333; font-size: 14px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartItemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" style="padding: 15px 10px 5px 10px; text-align: right; font-size: 16px; font-weight: bold; color: #333;">Grand Total:</td>
                            <td style="padding: 15px 10px 5px 10px; text-align: right; font-size: 18px; font-weight: bold; color: #FFA500;">
                                ₦${orderObject.total.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
                
                <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">
                    Need help? Reply to this email or call us at (123) 456-7890.
                </p>
            </div>
        </div>

            `

            /*`
            <div>
            <div><h2><img src="https://ibb.co/VpNv76Gk" /> Goldyvhista Hubz</h2></div>
            <div>
            <h2> Order confirmation </h2>
            <p> <b>${orderObject.userDetails.name} </b> Thank you for your order! </p>
            <p>We've recieved your order and will contact you as soon as your package is shpped. You can find details of your purchase below. </p>
            </div>
            <div>
            <h2> Order Summary </h2>
            <p>${orderObject.date}</p>
            <p>${orderObject.ID}</p>
            ${
                orderObject.cart.map( item=>{
                (
                    <div>
                        <img src={item.imageUrl} />
                         <p>Product Name: {item.name}</p>
                         <p> Product ID: {item.productID}</p>
                        <p>Quantity: {item.quantity} at {item.sellingPrice}</p>
                        <p>Total: N{item.sellingPrice*item.quanity}</p>
                    </div>
                )    
                })
            }
            <p>Grand Total: ${orderObject.total} </p>
            </div>

            </div>
            `*/
        }
        const response = await axios.post(url, emailData, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })
        if (response){
            res.status(200).json({
                message: "Order placed!"
            })
        }
     /*   try{
            const response = await axios.post(url, emailData, {
                headers: {
                    'Content-Type': 'application/json', 
                    'api-key': apiKey
                }
            })
            if(response){
                res.status(200).json({
                    message: "Email verification link sent!"
                })
            }
     
        }catch(err){
            console.log('error happeed', err)
        } */
      }
//        console.log(orderObject.timeStamp, 'here', orderObject.date.toString())
    }catch(err){
        console.log(err)
    } 
})




//update user details 

router.patch('/user/update/:email', async(req,res) =>{
    const email = req.params;
    const {name, phone, address1, address2, delivery} = req.body.inputs; 
    const errors = {}

    const validateField = (field, regex, erorMessage, required=true) =>{
        const value = req.body.inputs[field]? req.body.inputs[field].trim() : ''; 

        if(required&&!value){
            errors[`${field}Error`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            return false;
        }
        if(value && !regex.test(value)){
            errors[`${field}Error`] = errorMessage;
            return false;
        }
        return true; 
    }


    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    validateField(
        'name',
        nameRegex,
        "Name must be 2-50 characters (letters, spaces, hyphens, apostrophes only)."
    );

    const phoneRegex = /^\+?[\d\s\(\)-]{7,15}$/;
    validateField(
        'phone',
        phoneRegex,
        "Invalid phone format. Use 7-15 characters (digits, +, spaces, -, ())."
    );

    const addressRegex = /^[a-zA-Z0-9\s.,'#/-]{5,100}$/;
    validateField(
        'address1',
        addressRegex,
        "Invalid Address format or length (5-100 characters)."
    );
     validateField(
        'address2',
        addressRegex,
        "Invalid Address 2 format or length (5-100 characters).",
        false  
    )
    
    // --- 4. Handle Validation Errors ---
    if (Object.keys(errors).length > 0) {
        // Return a 400 Bad Request response with the specific errors
        return res.status(400).json({ 
            message: "Validation Failed", 
            errors: errors 
        });
    }

    try{

       // console.log('got here', email, req.body.inputs)
            //search for object using email
            //if found, update entry

            const collection = db.collection('gdvsta-users')
            const userExists = await collection.findOne({email:email.email})
            if (!userExists){
                console.log('User doesnt exists' )
                return res.status(400).json({
                    message: "User not found"
                })
            } 
            if(userExists){
                const filter = {email:email.email}
                const updateDetails = {
                   $set: { name: name,
                    phone: phone,
                    delivery: delivery,
                    address1: address1,
                    address2: address2}
                }
                const options = {
                    // This is the key: tells MongoDB to return the document *after* the update
                    returnDocument: 'after' 
                    // Older versions use 'returnOriginal: false'
                };

                const updateUser = await collection.findOneAndUpdate(filter, updateDetails,options)
                if(updateUser){
                    
                    const updatedUser = {
                        email: updateUser.email, 
                        userid: updateUser.userid,
                        delivery: updateUser.delivery,
                        address1: updateUser.address1,
                        address2: updateUser.address2,
                        name: updateUser.name,
                        phone: updateUser.phone, 
                        type: updateUser.type,
                        clearance: updateUser.clearance
                    }
                    
                    res.status(200).json({
                        message: "Operation successful",
                        data: updatedUser
                    })
                }
            }

    }catch(err){
        console.log(err)
        return res.status(400).json({
            message: "An error occurred",
            errors: err 
        })
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
  

    try{
        let newProduct={
            name:req.body.name,
            brand:req.body.brand,
            price:req.body.price,
            sellingPrice:req.body.sellingPrice,
            discount:req.body.discount,
            primaryCategory:req.body.category,
            imageUrl:req.body.imglnk,
            imageUrl2:req.body.imglnk2,
            imageUrl3:req.body.imglnk3,
            imageUrl4:req.body.imglnk4,
            date:req.body.date,
            description:req.body.description,
            deal: req.body.deal,
            popular: req.body.popular,
            productID: Date.now()
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
                sellingPrice:req.body.sellingPrice,
                discount:req.body.discount,
                primaryCategory:req.body.category,
                imageUrl:req.body.imglnk,
                imageUrl2:req.body.imglnk2,
                imageUrl3:req.body.imglnk3,
                imageUrl4:req.body.imglnk4,
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
   const limit = req.query.rows*1 || 20;
   const skip = page*limit; 
   const category = req.query.category || '';
   const search = req.query.searchquery;
   

   
try{ 
    const collection = db.collection('gdvsta-store')
    if(category){
    
    const items = await collection.aggregate([
        { "$facet": {
        "totalData": [
            { "$match": {primaryCategory: {$regex: category} }}, 
            {"$sort":{date:-1}},
            { "$skip": skip },
            {"$limit": 20},
            
        ],
        "totalCount": [
            { "$match": { primaryCategory: { $regex: category } } },
            { "$count": "count" }
        ]
        }}
    ]).toArray() 

    res.status(200).json(items)
    } else if(search){
        
        const items = await collection.aggregate([
            { "$facet": {
            "totalData": [
                { "$match": {$or: [{name: {$regex: search, $options: "i"}}, {description: {$regex: search, $options: "i"}}]}}, 
                {"$sort":{date:-1}},
                { "$skip": skip },
                {"$limit": 20},
                
            ],
            "totalCount": [
                { "$match": { description: { $regex: search } } },
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
            {"$limit": 20},
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


// get related items 

router.get('/relateditems/:id', async (req,res) =>{

    try {
        const relatedItems = []
        const collection = db.collection('gdvsta-store')
        const idQuery = new ObjectId(req.params.id)
        const item = await collection.findOne({
            _id: idQuery
        })
        if (item){

            const relatedCatItems = await collection.aggregate([
                {
                    $match: {
                        primaryCategory: item.primaryCategory,
                        _id: {$ne: idQuery}
                    }
                }, 
                {
                    $sample: {size: 6}
                }
            ]).toArray()

            const otherCatItems = await collection.aggregate([
                {
                    $match: {
                        primaryCategory: { $ne: item.primaryCategory }
                        
                    }
                }, 
                {
                    $sample: {size: 6}
                }
            ]).toArray()

            const data = {
                'main item': item, 
                'relatedItems': relatedCatItems,
                'others': otherCatItems,
                }

            res.status(200).json(data)
        }

    }catch (err){
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
        const data = popularItems.reverse().slice(0,12)
        res.status(200).send(data)
        
    } catch(err){console.log(err)}
})


//get deals
router.get ('/deals', async(req,res)=>{
    try{
        const collection = db.collection('gdvsta-store')
        const deals =  await collection.find({deal:true}).toArray()
        const reverseDeals = deals.reverse().slice(0,6)
        res.status(200).send(reverseDeals)
        
    } catch(err){console.log(err)}
})

 

export default router; 