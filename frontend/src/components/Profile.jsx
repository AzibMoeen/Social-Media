import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import Followers from './Followers';
import Followings from './Following';
import { toast } from 'sonner';


const Profile = () => {
  const [open, setOpen] = useState(false);
  const [following,setFollowings] = useState([])
  const [on, setOn] = useState(false);
  const params = useParams();
  const userId = params.id;
  const [followers, setFollowers] = useState([]);
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false); 

  const dispatch = useDispatch();

  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;

  useEffect(() => {
    if (userProfile && user) {
      if(user.following.includes(userProfile._id)){
        setIsFollowing(true);
      }
    }
    
  }, [userProfile, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const handleFollow = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${userProfile?._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.message==='followed successfully') {
      
        setIsFollowing(true);
        toast.success(`You are now following ${userProfile?.username}`);
      }else{
        setIsFollowing(false);
        toast.success(`You have unfollowed ${userProfile?.username}`);
      }
        
        if (isFollowing) {
          dispatch({
            type: 'REMOVE_FOLLOWING',
            payload: userProfile?._id,
          });
        } else {
          dispatch({
            type: 'ADD_FOLLOWING',
            payload: userProfile?._id,
          });
        }
        console.log('Follow/Unfollow success:', res.data.message);
      
    } catch (error) {
      console.log('Error in follow/unfollow:', error);
    }
  };
  const handleFollowersDet = async() => {
    
    const res = await axios.get(`http://localhost:8000/api/v1/user/allfollowers/${userId}`);
      setFollowers(res.data.follow);
   
    console.log(res.data);
    setOpen(true);
  }

  const handleFollowing1 = async() =>{

    const res = await axios.get(`http://localhost:8000/api/v1/user/allfollowings/${userId}`);
      setFollowings(res.data.following);
  
    console.log(res.data);
    setOn(true);
  }


  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                      
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className='h-8 cursor-pointer' onClick={handleFollow}>Unfollow</Button>
                        <Button variant='secondary' className='h-8'>Message</Button>
                      </>
                    ) : (
                      <Button onClick={handleFollow} className='bg-[#0095F6] hover:bg-[#3192d2] h-8 cursor-pointer'>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p onClick={handleFollowersDet} className='cursor-pointer'><span className='font-semibold' >{userProfile?.followers.length} </span>followers</p>
                <p onClick={handleFollowing1} className='cursor-pointer'><span className='font-semibold'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer'>REELS</span>
            <span className='py-3 cursor-pointer'>TAGS</span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })
            }
          </div>
          <Followers open={open} setOpen={setOpen} followers={followers} />
          <Followings on={on} setOn={setOn} followings={following} /> 
        </div>

        
      </div>
    </div>
  );
};

export default Profile;
