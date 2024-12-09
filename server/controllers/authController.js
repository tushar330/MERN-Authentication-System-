import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { JsonWebTokenError } = jwt; 
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from './emailTemplate.js';

//controller functions
export const register = async (req,res) => {

    const {name,email,password} = req.body;
    
    if(!name || !email || !password){
        return res.json({success:false , message:'Missing Details'})
    }

    try{

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.json({success:false , message : "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name, email, password:hashedPassword});

        await user.save();

        //generate token for user
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn : '7d' })

        //sending token to cookie
        res.cookie('token', token,{
            httpOnly:true,
            secure :process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV ==='production' ? 'none':'strict',
            maxAge : 7*24*60*60*1000
        });

        //sending welcome email
        const mailOptions ={
            from : process.env.SENDER_EMAIL,
            to : email,
            subject:`WELCOME!! Your account has been created with email id : ${email} `
        }

        await transporter.sendMail(mailOptions);

        return res.json({success:true});

    }catch(error){
        return res.json({success:false , message:error.message})
    }
}


export const login = async (req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false , message:'Email and password are required'})
    }

    try{

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message : 'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false, message : 'Invalid password'})
        }

        //generate token for existing user , using this token user will be authenticated and loggedin in the website

         //generate token for user
         const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn : '7d' })

         //sending token to cookie
         res.cookie('token', token,{
             httpOnly:true,
             secure :process.env.NODE_ENV === 'production',
             sameSite : process.env.NODE_ENV ==='production' ? 'none':'strict',
             maxAge : 7*24*60*60*1000
         });

         return res.json({success:true});

    }catch(error){
        return res.json({success:false , message:error.message});
    }
}


export const logout = async (req,res)=>{
    
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure :process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV ==='production' ? 'none':'strict',
        })
        return res.json({success:true , message:"Logged Out"});
    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}

//Send verification OTP to user's email
export const sendVerifyOtp = async (req,res)=>{
    try {
        
        const { userId } = req.body;  // WE WILL GET THE USERID FROM THE TOKEN SO we need middleware that will get the cookie and from cookie it will find token and useriD will be added in the body

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success:false , message:"Account is already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24*60*60*1000 ;  //one day expiry

        await user.save();

        const mailOption = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject:"Account Verification OTP",
            // text:`Your OTP is ${otp}`,
            html:  EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOption);

        return res.json({success:true, message: 'Verification OTP sent on Email'})

    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}


//verifying the user email using otp
export const verifyEmail = async (req,res)=>{
    const { userId , otp } = req.body;

    if(!userId || !otp){
        return res.json({success:false, message: 'Missing Details'})
    }

    try {
        
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false , message:'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success:false , message : 'Invalid OTP'});
        }

        if(user.verifyOtpExpiresAt < Date.now()){
            return res.json({success:false , message:'OTP Expired'});
        }

        user.isAccountVerified = true;

        user.verifyOtp ='';
        user.verifyOtpEpiresAt = 0;

        await user.save();

        return res.json({success:true , message : "Email verified successfully"});

    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}


//user is authenticated ?
//use middleware beacuse we HAVE TO VERIFY USING COOKIE
export const isAuthenticated = async (req,res)=>{
    try {
        return res.json({success:true});
    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}


//Send password rest otp
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success:false , message:'Email is required'});
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!email){
            return res.json({success:false , message:'User not found'});
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15*60*1000 ;  //one day expiry 
        
        await user.save();

        const mailOption = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject:"Password change OTP",
            html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",email)
        }
        await transporter.sendMail(mailOption);

        return res.json({success:true, message: 'OTP sent on Email'})

    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}


//reset user password
export const resetPassword = async (req,res)=>{

    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false , message:'All fields are required'});
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false , message:'User not found'});
        }

        if(user.resetOtp ='' || user.resetOtp !== otp){

            return res.json({success:false , message:'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false , message:'OTP expired'});
        }

        //now encrypt the pass to store in database
        const hassedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hassedPassword;

        user.resetOtp="";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message: 'Password has been reset successfully'});

    } catch (error) {
        return res.json({success:false , message:error.message});
    }
}