import express from 'express';
import bcrypt from 'bcryptjs';
import {BSON, ObjectId} from 'mongodb';

import db from './db.js'

const router = express.Router();

//AUTH APIs
//admin register
router.post('/auth/admin-register', async(req,res)=>{
 const salt = bcrypt.genSaltSync(10);
 const passwordHash = bcrypt.hashSync(req.body.password, salt)
 console.log(req.body)
 res.json('This has been bood')
})




export default router; 