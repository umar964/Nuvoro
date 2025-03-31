const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const generateOTP = ()=>{
    return Math.floor(100000 + Math.random()*900000);
};
console.log(generateOTP)



const sendOTP = async(email,otp)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth : {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASS,
        },
    });

    const mailOptions = {
        from: process.env.MY_MAIL,
        to: email,
        subject : 'your OTP code',
        text : `Your OTP code is${otp}.it will expire in 10 minutes .`,

    };
    try{
        await transporter.sendMail(mailOptions);
        console.log("OTP send successfully");

    }catch(err){
        console.log("Error " , err);

    }
};

const generateToken =(otp) =>{
    return jwt.sign({otp},process.env.MY_SECRET_KEY ,{expiresIn :'10 Minute'});
};

const verifyOtp =(token,inputotp)=>{
    try{
        const decoded = jwt.verify(token,process.env.MY_SECRET_KEY);
        return decoded.otp === inputotp;
    }catch(err){

        console.log(err);
        return false;
    }
};
 
module.exports = {generateOTP,sendOTP,generateToken,verifyOtp};