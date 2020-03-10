const User = require("../models/user");
const JWT = require("jsonwebtoken");
const { JWT_SECRET } = require("../configuration");

signWithToken = (user) => {
    return  JWT.sign({
        iss: '',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 6)
    }, JWT_SECRET)
}

const signUp =  async (req, res, next) =>{
    const { email, password, username } = req.body;
    
    const avatarColor = `rgb(${Math.random() * (200 - 3) + 3}, ${Math.random() * (200 - 3) + 3}, ${Math.random() * (200 - 3) + 3})`;

    const foundUser = await User.findOne({ email });
    if (foundUser) {
        return res.status(403).json({ error: 'A user with such email already exsits!' });
    }

    const newUser = new User({ email, password, username, avatarColor });
    await newUser.save();

    
    //get token
    const token = signWithToken(newUser);

    //send token
    res.status(200).json({ token })
}

const signIn = (req, res, next) =>{
    const token = signWithToken(req.user);

    res.status(200).json({ token });

}
const getInfo = (req, res, next) =>{

    const { username, email, _id, avatarColor} = req.user;
    res.json({ username, email, _id, avatarColor });
}

const find = (req, res) => {
    const { email, username } = req.body;

    User.find().or([{ email }, { username }])
    .select(['_id', 'username', 'avatarColor', 'email'])
    .exec((err, user) => {
        return res.json(user);
    })

}

const setLastSeen = ({userId, lastSeen, isOnline}) => {
    User.findOneAndUpdate({_id: userId}, { isOnline: isOnline, lastSeen: lastSeen }, { upsert: true }, (err) => {}); 
    

}


module.exports = {signIn, signUp, getInfo, find, setLastSeen};