import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();
const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "yasiruisuranga1@gmail.com",
            pass: process.env.APP_PS
        }
    })

export function registerUser(req, res) {

    const data = req.body;

    data.password = bcrypt.hashSync(data.password, 10)

    const newUser = new User(data)

    newUser.save().then(() => {
        res.json({ message: "User registration successfully" })
    }).catch((error) => {
        res.status(500).json({ error: "User registration failed" })
    })

}

export function loginUser(req, res) {
    const data = req.body

    User.findOne({
        email: data.email
    }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({ error: "User not found" })
            } else {

                if (user.isBlocked) {
                    res.status(403).json({ error: "Your account is Blocked please contact the admin" });
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password)

                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        phone: user.phone,
                        emailVerified: user.emailVerified
                    }, process.env.JWT_SECRETE);
                    res.json({ message: "Login successful", token: token, user: user });
                } else {
                    res.status(401).json({ error: "password is incorrect" })
                }

            }
        }
    )
}

export function isItAdmin(req) {
    let isAdmin = false;

    if (req.user != null) {
        if (req.user.role == "admin") {
            isAdmin = true;
        }
    }

    return isAdmin;
}

export function isItCustomer(req) {
    let iscustomer = false;

    if (req.user != null) {
        if (req.user.role == "customer") {
            iscustomer = true;
        }
    }

    return iscustomer;
}

export async function getAllUsers(req, res) {
    if (isItAdmin(req)) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: "Fail to get Users" })
        }
    } else (
        res.status(403).json({ error: "Unauthorized request !" })
    )
}

export async function userBlockOrUnblock(req, res) {
    const email = req.params.email;
    if (isItAdmin(req)) {
        try {
            const user = await User.findOne({ email: email })
            if (user == null) {
                res.status(404).json({ error: "User not found !" });
            }

            const isBlocked = !user.isBlocked;

            await User.updateOne(
                {
                    email: email
                },
                {
                    isBlocked: isBlocked
                }
            );

            res.json({ message: "User blocked/unblocked successfully" })
        } catch (e) {
            res.status(500).json({ error: "Failed to get user" });
        }
    } else {
        res.status(403).json({ error: "Unathorized request !" })
    }
}

export function getUser(req, res) {
    if (req.user != null) {
        res.json(req.user);
    } else {
        res.status(403).json({ error: "User not found" });
    }
}

export default async function loginWithGoogle(req, res) {
    const accessToken = req.body.accessToken;
    console.log(accessToken);
    // https://www.googleapis.com/auth/userinfo.email
    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        });
        console.log(response.data);
        const user = await User.findOne({
            email: response.data.email,
        });
        if(user !=null){
           const token = jwt.sign({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        phone: user.phone,
                        emailVerified: true
                    }, process.env.JWT_SECRETE);
                    res.json({ message: "Login successful", token: token, user: user }); 
        }else{
            const newUser = User({
                email: response.data.email,
                password: "123",
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                addresss: "Not Given",
                phone: "Not Given",
                profilePicture: response.data.picture,
                emailVerified : true,
            });
            const savedUser = await newUser.save();
            const token = jwt.sign({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        phone: user.phone
                    }, process.env.JWT_SECRETE);
                    res.json({ message: "Login successful", token: token, user: user });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ Error: "Failed to log on with Google" })
    }
}

export async function sendOTP(req,res){

    if(req.user == null){
        res.status(403).json({error : "Unauthorized"})
        return;
    }

    //genarate number between 1000 and 9999
    const otp = Math.floor(Math.random()*9000) + 1000;
    //save otp in database
    const newOTP = new OTP({
        email: req.user.email,
        otp: otp
    })
    await newOTP.save();

    const message = {
        from : "yasiruisuranga1@gmail.com",
        to : req.user.email,
        subject : "Validating OTP",
        text : "Your otp code is "+otp
    }

    transport.sendMail(message, (err, info) => {
        if(err){
            console.log(err);
            res.status(500).json({error : "Failed to sent Otp"})
        }else{
            console.log(info)
            res.json({message: "OTP Sent successfully"})
        }
    });
}

export async function verifyOTP(req,res){
  if(req.user == null){
    res.status(403).json({error : "Unauthorized"})
    return;
  }
  const code = req.body.code;

  const otp = await OTP.findOne({
    email : req.user.email,
    otp : code
  })

  if(otp == null){
    res.status(404).json({error : "Invalid OTP"})
    return;
  }else{
    await OTP.deleteOne({
      email : req.user.email,
      otp : code
    })

    await User.updateOne({
      email : req.user.email
    },{
      emailVerified : true
    })

  }
  
}