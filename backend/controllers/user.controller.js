import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
    
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log(isPasswordMatch);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });


        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; 
        const jiskoFollowKrunga = req.params.id; 
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }
        console.log(followKrneWala, jiskoFollowKrunga);

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        
     
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if (isFollowing) {
            
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
  
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
    } catch (error) {
        console.log(error);
    }
}

const searchhUser = async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required and must be a string" });
    }

    try {
        const users = await User.aggregate([
            {
                $search: {
                    index: 'default', 
                    text: {
                        query: query,
                        path: ['username', 'email'],
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 3
                        }
                    }
                }
            },
            {
                $project: {
                    password: 0,       
                    email: 0,            
                    followers: 0,        
                    following: 0,        
                    posts: 0,            
                    bookmarks: 0,        
                    gender: 0,           
                   
                }
            }
        ]).exec();
     
        console.log(users); 
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const Allfollowers = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the user by ID
        const user = await User.findById(id).exec();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        

        // Fetch all followers details
        const followers = await Promise.all(
            user.followers.map(async (followerId) => {
                try {
                    const follower = await User.findById(followerId).select('-password -email -bookmarks -followers -following').exec();
                    return follower;
                } catch (err) {
                    console.error(`Error fetching follower with ID ${followerId}:`, err);
                    return null; // Return null for failed fetches
                }
            })
        );

     
        const validFollowers = followers.filter(follower => follower !== null);

        console.log('Fetched followers:', validFollowers);

        return res.status(200).json({
            follow: validFollowers,
            success: true
        });
    } catch (error) {
        console.error('Error fetching followers:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const Allfollowings = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the user by ID
        const user = await User.findById(id).exec();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        

        // Fetch all followers details
        const followers = await Promise.all(
            user.following.map(async (followerId) => {
                try {
                    const follower = await User.findById(followerId).select('-password -email -bookmarks -followers -following').exec();
                    return follower;
                } catch (err) {
                    console.error(`Error fetching follower with ID ${followerId}:`, err);
                    return null; // Return null for failed fetches
                }
            })
        );

     
        const validFollowers = followers.filter(follower => follower !== null);

        console.log('Fetched followers:', validFollowers);

        return res.status(200).json({
            following: validFollowers,
            success: true
        });
    } catch (error) {
        console.error('Error fetching followers:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


export { searchhUser}; 