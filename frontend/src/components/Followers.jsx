import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { useNavigate } from 'react-router-dom';  navigation

const Followers = ({ open, setOpen, followers }) => {
  const navigate = useNavigate(); 

  const handleFollowerClick = (followerId) => {
    setOpen(false); 
    navigate(`/profile/${followerId}`); 
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {followers.length > 0 ? (
            followers.map(follower => (
              <div 
                key={follower._id} 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg" 
                onClick={() => handleFollowerClick(follower._id)}
              >
                <Avatar>
                  <AvatarImage src={follower.profilePicture} alt={`${follower.username}'s profile`} />
                  <AvatarFallback>{follower.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-sm">{follower.username}</p>
              </div>
            ))
          ) : (
            <p>No followers found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Followers;
