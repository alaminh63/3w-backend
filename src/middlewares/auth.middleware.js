// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
// import jwt from "jsonwebtoken";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { User } from "../models/users.model.js";

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id).select("-password -refreshToken");
//   done(null, user);
// });

// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.ACCESS_TOKEN_SECRET,
// };

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     },
//     async (req, res, accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ "google.id": profile.id });

//         if (!user) {
//           // Create a new user with Google profile information and set the role to "user"
//           user = await User.create({
//             fullName: profile.displayName,
//             email: profile.emails[0].value,
//             avatar: profile.photos[0].value,
//             userName: profile.displayName.toLowerCase().replace(/\s/g, "_"),
//             "google.id": profile.id,
//             "google.accessToken": accessToken,
//             "google.refreshToken": refreshToken,
//             role: "user", // Set the role to "user" for new users
//           });
//         } else {
//           // Update the user's tokens
//           user.google.accessToken = accessToken;
//           user.google.refreshToken = refreshToken;
//           await user.save();
//         }

//         // Generate and attach local access and refresh tokens
//         const {
//           accessToken: localAccessToken,
//           refreshToken: localRefreshToken,
//         } = await generateAccessAndRefreshTokens(user._id);
//         user.accessToken = localAccessToken;
//         user.refreshToken = localRefreshToken;

//         // Set cookies
//         const options = {
//           httpOnly: true,
//           secure: true,
//         };

//         // Set the cookies for accessToken and refreshToken
//         res.cookie("accessToken", localAccessToken, options);
//         res.cookie("refreshToken", localRefreshToken, options);

//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

// passport.use(
//   new JwtStrategy(jwtOptions, async (payload, done) => {
//     try {
//       const user = await User.findById(payload._id).select(
//         "-password -refreshToken"
//       );

//       if (!user) {
//         return done(null, false);
//       }

//       return done(null, user);
//     } catch (error) {
//       return done(error, false);
//     }
//   })
// );
// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     const authorization = req.headers.authorization;
//     // const token = authorization.split(" ")[1]; //for browser
//     const token =
//       authorization.split(" ")[1] ||
//       req.cookies?.accessToken ||
//       req.header("Authorization")?.replace("Bearer", "");
//     if (!token) {
//       throw new ApiError(401, "Unauthorized request");
//     }

//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodedToken._id).select(
//       "-password -refreshToken"
//     );

//     // console.log("User Role:", user.role); // Log the user's role
//     if (!user) {
//       throw new ApiError(401, "Invalid Access Token");
//     }

//     req.user = user;

//     // You can optionally store the decoded token in the request for future use
//     req.decodedToken = decodedToken;

//     // Continue to the next middleware or route handler
//     next();
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid Access Token");
//   }
// });

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id).select("-password -refreshToken");
  done(null, user);
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({ "google.id": profile.id });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            userName: profile.displayName.toLowerCase().replace(/\s/g, "_"),
            "google.id": profile.id,
            role: "user",
          });
        } else {
          user.google.accessToken = accessToken;
          user.google.refreshToken = refreshToken;
          await user.save();
        }

        const {
          accessToken: localAccessToken,
          refreshToken: localRefreshToken,
        } = await generateAccessAndRefreshTokens(user._id);
        user.accessToken = localAccessToken;
        user.refreshToken = localRefreshToken;

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token =
      authorization.split(" ")[1] ||
      // req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    req.decodedToken = decodedToken;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const googleAuthMiddleware = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallbackMiddleware = passport.authenticate("google", {
  failureRedirect: "/",
});

export const handleGoogleAuthCallback = (_, res) => {
  res.redirect("/");
};
