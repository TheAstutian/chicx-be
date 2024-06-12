import express from 'express';
import cors from'cors'
import cookieParser from 'cookie-parser';

import db, { database } from './db.js';
import router from './routes.js';

const app = express();
const port = process.env.PORT || 4000; 
app.use(cors())
app.use(express.json()) 
app.use(cookieParser())
app.use(router)  

const sample_db = {
    one: "sample 1",
    two: "sample2",
}

app.get('/', (req,res)=>{
    res.json(sample_db)
})

app.get('/products', (req,res)=>{
    res.json(database)
})

app.get('/products/:id', (req,res)=>{
    res.status(200).json(database[req.params.id-1]) 
})

app.listen(8800, ()=>{
    console.log("Connected!")
}) 