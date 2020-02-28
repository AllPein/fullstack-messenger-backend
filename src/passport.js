const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const { JWT_SECRET } = require("./configuration");

//JWT strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try{
        //Find the user with given token
        const user = await User.findById(payload.sub);
        
        if (!user) {
            return done(null, false);
        }
        //if user exists
        return done(null, user);

    } catch(err) {
        return done(err, false);
    }
}));

//Local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try{
        //find the user with givem email
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false);
        }

        const isMatch = await user.isValidPassword(password);
        
        if (!isMatch) {
            return done(null, false);
        }

        done(null, user);
    } catch(err) {
        done(err, false);
    }
    
}));
