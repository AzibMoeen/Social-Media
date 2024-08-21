import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';

const SuggestedUsers = () => {
    const handleFollow = async () => {
        try {
          const res = await axios.post(
            `http://localhost:8000/api/v1/user/followorunfollow/${user._id}`,
            {},
            { withCredentials: true }
          );
    
          if (res.data.success) {
            
            setIsFollowing(!isFollowing);
    
            
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
          }
        } catch (error) {
          console.log('Error in follow/unfollow:', error);
        }
      };
    const { suggestedUsers } = useSelector(store => store.auth);
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    return (
                        <div key={user._id} className='flex items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                    <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            <span onClick={handleFollow} className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6] '>Follow</span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers