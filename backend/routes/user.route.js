import express from "express";
import { Allfollowers, editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register, searchhUser, Allfollowings  } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);
router.route('/search').get(searchhUser); 
router.route('/allfollowers/:id').get(Allfollowers);
router.route('/allfollowings/:id').get(Allfollowings);

export default router;