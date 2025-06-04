const userModel = require("../models/user.model")
const jwt = require ("jsonwebtoken")
const {signInErrors, signUpErrors} = require ("../utils/errors.util")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")

const maxAge = 3*24*60*60*1000

const createToken = (id) => {
    return jwt.sign({id}), process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    }
}

const transport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

module.exports.signUp = async (req,res) => {
    console.log(req.body)
    const {pseudo, email, password} = req.body

    try{
        const user = await userModel.create({pseudo, email, password})
        res.status(201).json({ user: user._id})
    }
    catch(err){
        const errors = signUpErrors(err)
        res.status(200).send({errors})
    }
}

module.exports.signIn = async (req,res) => {
    const {email, password} = req.body


    try {
        const user = await userModel.login(email, password)
        const token = createToken(user._id)
        res.cookie("jwt", token, {httpOnly: true, maxAge})
        res.status(200).json({user: user._id})
    }
    catch(err) {
        const errors = signInErrors(err)
        res.status(200).json({errors})
    }

    }

module.exports.logout = (req,res) => {
    res.cookie("jwt", "", {maxAge: 1})
    res.redirect("/")
}

module.exports.resetPasswordLink = async (req,res) => {
    const {email} = req.body.email;
    
    if (!email){
        res.status(401).json({status:401, message: "Entrez votre email"})
    }
    
    try {
        const userfind = await userModel.findOne({email:email})
    
        const token = jwt.sign({_id:userfind._id}, process.env.TOKEN_SECRET,{
            expiresIn:"900s"
        })

        const setUserToken = await userModel.findByIdAndUpdate({_id:userfind._id}, {verifytoken:token}, {new:true})

        if(setUserToken){
            const mailOptions = {
                from:process.env.EMAIL,
                to:email,
                subject:"lien pour changement de mot de passe",                    
                text:`ce lien n'est valide que durant les 15 prochaines minutes  ${process.env.CLIENT_URL}/forgotpassword/${userfind.id}/${setUserToken.verifytoken}`
            }

            transport.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("error",error)
                    res.status(401).json({status:401, message:"Le mail n'a pas été envoyé"})
                } else {
                    console.log("Email envoyé", info.response);
                    res.status(201).json({status:201, message:"Email envoyé avec succés"})
                }
            })
        }
    }
    
    catch(error) {
        res.status(401).json({status:401, message:"utilisateur invalide"})
    }
}

module.exports.ForgotPasswordChecking = async (req,res)=> {
    const {id,token} = req.params;

    try {
        const validUser = await userModel.findOne({_id:id, verifytoken:token})
        const verifyToken = jwt.verify(token,process.env.TOKEN_SECRET)

        if(validUser && verifyToken._id){
            res.status(201).json({status:201,validUser})
        } else {
            res.status(401).json({status:401, message:"Utilisateur introuvable"})
        }
    }
    catch (error) {
        res.status(401).json({status:401,error})
    }
}

module.exports.updatePassword = async(req,res)=> {
    const {id,token} = req.params 
    const {password} = req.body.password 

    try {
        const validUser = await userModel.findOne({_id:id, verifytoken:token})
        const verifyToken = jwt.verify(token,process.env.TOKEN_SECRET)
        
        if(validUser && verifyToken._id){
            const newPassword = await bcrypt.hash(password,15)
            const setNewPassword = await userModel.findByIdAndUpdate({_id:id},{password:newPassword})

            setNewPassword.save()
            res.status(201).json({status:201, setNewPassword})
        } else {
            res.status(401).json({status:401,message:"utilisateur introuvable"})
        }
    }
    catch {
        res.status(401).json({status:401,error})
    }
}


