// user.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }; // Return tokens
  } catch (error) {
    console.error(`Error generating tokens: ${error.message}`);
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Tokens"
    );
  }
};

// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, userName, password } = req.body;

//   // Check if user is registering with Google
//   const isGoogleRegistration = req.user?.google?.id;

//   if (!isGoogleRegistration) {
//     // Handle traditional registration logic here

//     if (
//       [fullName, email, userName, password].some(
//         (field) => field?.trim() === ""
//       )
//     ) {
//       throw new ApiError(400, "All fields are required");
//     }

//     const existedUser = await User.findOne({ $or: [{ userName }, { email }] });

//     if (!existedUser) {
//       // Create a new user with Google profile information and set the role to "user"
//       await User.create({
//         role: "user",
//       });
//     }

//     if (existedUser) {
//       throw new ApiError(409, "User with email or username already exists");
//     }

//     const avatarLocalPath = req.files?.avatar?.[0]?.path;
//     // const coverImageLocalPath = req.files?.coverImage[0]?.path;

//     let coverImageLocalPath;
//     if (
//       req.files &&
//       Array.isArray(req.files.coverImage) &&
//       req.files.coverImage.length > 0
//     ) {
//       coverImageLocalPath = req.files.coverImage[0].path;
//     }
//     if (!avatarLocalPath) {
//       throw new ApiError(400, "Avatar is must required");
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//     if (!avatar) {
//       throw new ApiError(400, "Avatar is must required");
//     }

//     const user = await User.create({
//       fullName,
//       avatar: avatar.url,
//       coverImage: coverImage?.url || "",
//       email,
//       password,
//       userName: userName.toLowerCase(),
//     });

//     if (!user) {
//       throw new ApiError(500, "Something went wrong, user not created");
//     }

//     const createdUser = await User.findById(user._id).select(
//       "-password -refreshToken"
//     );

//     if (!createdUser) {
//       throw new ApiError(500, "Something is wrong, user not created");
//     }

//     return res
//       .status(201)
//       .json(new ApiResponse(200, createdUser, "User registered successfully"));
//   } else {
//     // User is registering with Google, handle as needed
//     // Check if the user already exists with the Google ID
//     const existingUser = await User.findOne({
//       "google.id": req.user.google.id,
//     });

//     if (existingUser) {
//       // If the user already exists, return the existing user
//       return res
//         .status(201)
//         .json(
//           new ApiResponse(
//             200,
//             existingUser,
//             "User registered with Google successfully"
//           )
//         );
//     } else {
//       // If the user doesn't exist, create a new user in the database
//       const user = await User.create({
//         fullName: req.user.displayName,
//         email: req.user.emails[0].value,
//         userName: req.user.displayName.toLowerCase().replace(/\s/g, "_"),
//         avatar: req.user.photos[0].value,
//         "google.id": req.user.id,
//         "google.accessToken": req.user.accessToken,
//         "google.refreshToken": req.user.refreshToken,
//         role: "user",
//       });

//       if (!user) {
//         throw new ApiError(500, "Something went wrong, user not created");
//       }

//       const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//       );
//       // console.log(user);
//       return res
//         .status(201)
//         .json(
//           new ApiResponse(
//             200,
//             createdUser,
//             "User registered with Google successfully"
//           )
//         );
//     }
//   }
// });

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Field ARE REQUIRED");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage.length > 0)) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is must required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is must required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
    role: "user",
  });
  console.log(user);
  if (!user) {
    throw new ApiError(500, "Something went wrong, user not created");
  }
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something is wrong user not created ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  // console.log(req.user);
  const isGoogleLogin = req.user?.google?.id;

  if (!isGoogleLogin) {
    if (!(email || userName)) {
      throw new ApiError(400, "Email or UserName must be provided for login");
    }

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) {
      throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(404, "Password incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    // console.log(user);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          req.user,
          "User logged in with Google successfully"
        )
      );
  }
});

const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Assuming you stored tokens in cookies
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(404, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(404, "Invalid Refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(404, "Refresh token Expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(404, error?.message || "Invalid Refresh Token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    // const { _id } = req.user;

    // if (!_id) {
    //   throw new ApiError(402, "Id not found");
    // }

    // // Assuming you have a Mongoose User model
    // const result = await User.findById(_id);

    // if (!result) {
    //   throw new ApiError(404, "User not found");
    // }

    // console.log(result);

    return res.status(200).json({
      status: 200,
      data: req.user,
      message: "Current User Logged Successfully",
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const makeAdmin = asyncHandler(async (req, res) => {
  try {
    const _id = req.params.userId;
    const userToUpdate = await User.findById(_id);

    if (!userToUpdate) {
      throw new ApiError(404, "User not found");
    }

    // Update the user's role to 'admin'
    userToUpdate.role = "admin";

    // Save the updated user
    await userToUpdate.save();

    return res
      .status(200)
      .json(new ApiResponse(200, userToUpdate, "User is now an admin"));
  } catch (error) {
    console.error("Error making user admin:", error);
    throw new ApiError(501, "Internal Server Error");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const _id = req.params.userId;
    const userToDelete = await User.findByIdAndDelete(_id);

    if (!userToDelete) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userToDelete, "User deleted successfully"));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  return res.status(200).json({
    status: 200,
    data: users,
    message: "All users retrieved successfully",
  });
});

const loginWithGoogle = asyncHandler(async (req, res) => {
  const { tokenId } = req.body;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/oauth2/v3/tokeninfo",
      { id_token: tokenId }
    );

    const { email, sub, name, picture } = response.data;

    let user = await User.findOne({ "google.id": sub });

    if (!user) {
      // Create a new user with Google profile information and set the role to "user"
      user = await User.create({
        fullName: name,
        email,
        avatar: picture,
        userName: name.toLowerCase().replace(/\s/g, "_"),
        "google.id": sub,
        role: "user", // Set the role to "user" for new users
      });
    }

    // Generate and attach local access and refresh tokens
    const { accessToken: localAccessToken, refreshToken: localRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    user.accessToken = localAccessToken;
    user.refreshToken = localRefreshToken;

    // Set cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Set the cookies for accessToken and refreshToken
    res.cookie("accessToken", localAccessToken, options);
    res.cookie("refreshToken", localRefreshToken, options);

    return res.status(200).json({
      user: user,
      accessToken: localAccessToken,
      refreshToken: localRefreshToken,
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(401, "Invalid Google token");
  }
});

export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  getCurrentUser,
  makeAdmin,
  loginWithGoogle,
  getAllUsers,
  deleteUser,
};
