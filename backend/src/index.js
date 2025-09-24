import express from "express"

const  app = express()
const port = 4000

app.get("/", (req, res)=>{
    res.send("Hello how are you!!")
})

app.get("/home", (req, res)=>{
    res.send("I am fine")
})

app.listen(port, ()=>{
    console.log(`App is listening at port ${port}`)
})