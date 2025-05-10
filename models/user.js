import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    },
    role : {
        type : String,
        required : true,
        default : "customer"
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    profilePicture : {
        type : String,
        required : true,
        default : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
    }
})

const User = mongoose.model("User",userSchema);

export default User;

//john.doe@example.com 123 - customer
//johnAdmin@example.com 123 - admin