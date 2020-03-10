const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    avatarColor: {
        type: String,
        required: false,
        unique: false,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: false 
    },
    password: {
        type: String,
        required: true
    },
    lastSeen: {
        type: Date,
        required: true
    },
    isOnline: {
        type: Boolean,
        required: true
    }
});

userSchema.pre("save", async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        
        this.password = hashedPassword;
        next();
    } catch(err) {
        next(err);
    }
});

userSchema.methods.isValidPassword = async function(password) {
    try{
        return await bcrypt.compare(password, this.password);
    } catch(err) {
        throw new Error(err);
    }
}
const User = mongoose.model('user', userSchema);

module.exports = User;