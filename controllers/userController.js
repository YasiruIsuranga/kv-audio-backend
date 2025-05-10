import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export function registerUser(req,res){

    const data = req.body;

    data.password = bcrypt.hashSync(data.password,10)

    const newUser = new User(data)

    newUser.save().then(()=>{
        res.json({message : "User registration successfully"})
    }).catch((error)=>{
        res.status(500).json({error : "User registration failed"})
    })

}

export function loginUser(req,res){
    const data = req.body

    User.findOne({
        email : data.email
    }).then(
        (user)=>{
            if(user == null){
                res.status(404).json({error : "User not found"})
            }else{

                if(user.isBlocked){
                    res.status(403).json({error: "Your account is Blocked please contact the admin"});
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password)

                if(isPasswordCorrect){
                    const token = jwt.sign({
                        firstName : user.firstName,
                        lastName : user.lastName,
                        email : user.email,
                        role : user.role,
                        profilePicture : user.profilePicture,
                        phone : user.phone
                    },process.env.JWT_SECRETE);
                    res.json({message : "Login successful", token : token, user : user });
                }else{
                    res.status(401).json({error : "password is incorrect"})
                }

            }
        }
    )
}

export function isItAdmin(req){
    let isAdmin = false;

    if(req.user != null){
        if(req.user.role == "admin"){
            isAdmin = true;
        }
    }

    return isAdmin;
}

export function isItCustomer(req){
    let iscustomer = false;

    if(req.user != null){
        if(req.user.role == "customer"){
            iscustomer = true;
        }
    }

    return iscustomer;
}

export async function getAllUsers(req,res){
    if(isItAdmin(req)){
        try{
            const users = await User.find();
            res.json(users);
        }catch(e){
            res.status(500).json({error : "Fail to get Users"})
        }
    }else(
        res.status(403).json({error : "Unauthorized request !"})
    )
}

export async function userBlockOrUnblock(req,res){
    const email = req.params.email;
    if(isItAdmin(req)){
        try{
            const user = await User.findOne({email: email})
            if(user == null){
                res.status(404).json({error: "User not found !"});
            }

            const isBlocked = !user.isBlocked;

            await User.updateOne(
                {
                    email:email
                },
                {
                    isBlocked: isBlocked
                }
            );

            res.json({message: "User blocked/unblocked successfully"})
        }catch(e){
            res.status(500).json({error : "Failed to get user"});
        }
    }else{
        res.status(403).json({error: "Unathorized request !"})
    }
}

export function getUser(req,res){
    if(req.user != null){
        res.json(req.user);
    }else{
        res.status(403).json({error: "User not found"});
    }
}   