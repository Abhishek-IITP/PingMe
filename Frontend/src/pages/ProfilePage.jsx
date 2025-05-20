import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, removeFriend, sendFriendRequest, getUserFriends, getOutgoingFriendReqs } from "../lib/api";
import { MapPinIcon, MessageSquareIcon, UserMinusIcon, UserPlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getLanguageFlag } from "../components/FriendCard";
import { capitialize } from "../lib/utills.js";
import toast from "react-hot-toast";
import { useEffect } from "react";

const ProfilePage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user's friends list, always refetch on mount and window focus
  const { data: friends = [], refetch: refetchFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    refetchFriends();
  }, [userId, refetchFriends]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      try {
        const response = await getUserProfile(userId);
        console.log("API Response:", response);
        return response;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
  });

  const { mutate: removeFriendMutation, isPending: isRemoving } = useMutation({
    mutationFn: () => removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend removed successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });

  const { mutate: sendRequestMutation, isPending: isSending } = useMutation({
    mutationFn: () => sendFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      toast.success("Friend request sent successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    },
  });

  const handleRemoveFriend = () => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      removeFriendMutation();
    }
  };

  const handleAddFriend = () => {
    sendRequestMutation();
  };

  // Check if the profile user is in the current user's friends list
  const isFriend = friends.some(friend => friend._id === userId);

  // Debug logs
  console.log("User ID:", userId);
  console.log("User Data:", user);
  console.log("Error:", error);
  console.log("Is Friend:", isFriend);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-base-content opacity-70">
            {error.response?.data?.message || error.message || "Failed to load profile"}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-base-content opacity-70">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-base-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-6 sm:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="avatar size-32">
                <img 
                  src={user.profilePic || "https://via.placeholder.com/150"} 
                  alt={user.fullName || "User"} 
                  className="rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2">{user.fullName || "Anonymous User"}</h1>
                {user.location && (
                  <div className="flex items-center justify-center sm:justify-start text-base-content opacity-70">
                    <MapPinIcon className="size-4 mr-1" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>

            {/* Language Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              {user.nativeLanguage && (
                <span className="badge badge-secondary text-sm">
                  {getLanguageFlag(user.nativeLanguage)}
                  Native: {capitialize(user.nativeLanguage)}
                </span>
              )}
              {user.learningLanguage && (
                <span className="badge badge-outline text-sm">
                  {getLanguageFlag(user.learningLanguage)}
                  Learning: {capitialize(user.learningLanguage)}
                </span>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">About</h2>
                <p className="text-base-content opacity-80">{user.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link to={`/chat/${user._id}`} className="btn btn-primary flex-1">
                <MessageSquareIcon className="size-4 mr-2" />
                Message
              </Link>
              {isFriend ? (
                <button
                  onClick={handleRemoveFriend}
                  disabled={isRemoving}
                  className="btn btn-error flex-1"
                >
                  <UserMinusIcon className="size-4 mr-2" />
                  Remove Friend
                </button>
              ) : (
                <button
                  onClick={handleAddFriend}
                  disabled={isSending}
                  className="btn btn-secondary flex-1"
                >
                  <UserPlusIcon className="size-4 mr-2" />
                  Add Friend
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 