import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { useNavigate } from 'react-router-dom';  navigation

const Followings = ({ on, setOn, followings }) => {
  const navigate = useNavigate(); 

  const handlefollowingClick = (followingId) => {
   setOn(false); 
    navigate(`/profile/${followingId}`); 
  }

  return (
    <Dialog open={on}>
      <DialogContent onInteractOutside={() => setOn(false)}>
        <DialogHeader>
          <DialogTitle>followings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {followings.length > 0 ? (
            followings.map(following => (
              <div 
                key={following._id} 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg" 
                onClick={() => handlefollowingClick(following._id)}
              >
                <Avatar>
                  <AvatarImage src={following.profilePicture} alt={`${following.username}'s profile`} />
                  <AvatarFallback>{following.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-sm">{following.username}</p>
              </div>
            ))
          ) : (
            <p>No followings found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Followings;
