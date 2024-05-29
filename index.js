import express from 'express';
import cors from'cors'

import { database } from './db.js';

const app = express();
app.use(cors())
app.use(express.json())

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

app.listen(8800, ()=>{
    console.log("Connected!")
})