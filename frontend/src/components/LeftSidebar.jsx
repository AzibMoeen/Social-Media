import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);

    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Search') {
            setSearchMode(true);
        }
    }

    const handleSearch = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/search', {
                params: {
                    query: searchQuery
                }
            });

            console.log('API Response:', res.data); // Log the API response
            
            if (res.data.users.length > 0) {
                setSearchResults(res.data.users);
            } else {
                setSearchResults([]); 
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error fetching search results');
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchMode(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [searchRef]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    const navigateToUserProfile = (userId) => {
        navigate(`/profile/${userId}`);
        setSearchMode(false);
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ];

    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>LOGO</h1>
                <div ref={searchRef}>
                    {
                        searchMode ? (
                            <div>
                                <div className='flex items-center'>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className='w-full p-3 rounded-lg border border-gray-300'
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className='ml-2 p-2 text-black rounded-lg'
                                    >
                                        <Search />
                                    </button>
                                </div>
                                <div className='mt-2'>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((user) => (
                                            <div 
                                                key={user._id} 
                                                className='flex items-center gap-2 my-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer'
                                                onClick={() => navigateToUserProfile(user._id)}
                                            >
                                                <Avatar>
                                                    <AvatarImage src={user.profilePicture} alt={user.username} />
                                                    <AvatarFallback>CN</AvatarFallback>
                                                </Avatar>
                                                <p className='text-sm'>{user.username}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No user found</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            sidebarItems.map((item, index) => (
                                <div 
                                    onClick={() => sidebarHandler(item.text)} 
                                    key={index} 
                                    className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'
                                >
                                    {item.icon}
                                    <span>{item.text}</span>
                                    {item.text === "Notifications" && likeNotification.length > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">
                                                    {likeNotification.length}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div>
                                                    {likeNotification.length === 0 ? (
                                                        <p>No new notification</p>
                                                    ) : (
                                                        likeNotification.map((notification) => (
                                                            <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                <Avatar>
                                                                    <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                    <AvatarFallback>CN</AvatarFallback>
                                                                </Avatar>
                                                                <p className='text-sm'>
                                                                    <span className='font-bold'>{notification.userDetails?.username}</span> liked your post
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            ))
                        )
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
        </div>
    );
}

export default LeftSidebar;
