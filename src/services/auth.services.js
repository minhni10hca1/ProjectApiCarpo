import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import User from '../modules/users/user.model';
import constants from '../config/constants';
// Local strategy
const localOpts = {
  usernameField: 'username',
};

const localStrategy = new LocalStrategy(
  localOpts,
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        console.log('sai ten dang nhap');
        return done(null, false, {
          message: 'User not found'
        });
      } else if (!user.authenticateUser(password)) {
        console.log('sai mat khau');
        return done(null, false);
      }

      return done(null, user);
    } catch (e) {
      console.log('stepcatch');
      return done(e, false);
    }
  },
);

// Jwt strategy
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: constants.JWT_SECRET,
};
const jwtStrategy = new JWTStrategy(jwtOpts, async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
});

passport.use(localStrategy);
passport.use(jwtStrategy);
export const authLocal = passport.authenticate('local', { session: false });
export const authJwt = passport.authenticate('jwt', { session: false });
