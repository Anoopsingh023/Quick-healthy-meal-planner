import React, { useEffect, useState } from "react";
import biryani from "../../assets/recipe/biryani.jpg";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { formatDistanceToNow } from "date-fns";
import { toggleLikeApi } from "../../apis/likeApi";

const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 animate-pulse flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Image */}
      <div className="w-full h-[300px] bg-gray-300 rounded-lg"></div>

      {/* Actions */}
      <div className="flex gap-4">
        <div className="h-4 w-10 bg-gray-300 rounded"></div>
        <div className="h-4 w-10 bg-gray-300 rounded"></div>
      </div>

      {/* Caption */}
      <div className="h-4 w-full bg-gray-300 rounded"></div>
      <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
    </div>
  );
};

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [showHeart, setShowHeart] = useState(null);

  // const [isLiked, setIsLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handlePostLike = async (postId) => {
  if (loading) return;

  setLoading(true);

  try {
    const res = await toggleLikeApi({
      targetId: postId,
      targetType: "Image",
    });
    console.log("toggle Like",res);
    fetchFeed()
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};
  const handleCommentLike = async (postId) => {
  if (loading) return;

  setLoading(true);

  try {
    const res = await toggleLikeApi({
      targetId: postId,
      targetType: "Comment",
    });
    console.log("toggle Comment Like",res);
    fetchFeed()
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  const handleDoubleClick = async (postId, isliked) => {
  // show animation
  setShowHeart(postId);

  setTimeout(() => {
    setShowHeart(null);
  }, 800);
  console.log("dobble click", postId)

  // auto like if not liked
  if(!isliked){
    handlePostLike(postId)
  }
};

  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${base_url}/feeds/`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log("Feed", res.data);
      setFeeds(res.data);
    } catch (error) {
      console.error("Feed errer", error);
    }
  };

  useEffect(() => {
    fetchFeed();
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedPost]);

  const shortLocale = {
    formatDistance: (token, count) => {
      const units = {
        lessThanXSeconds: "now",
        xSeconds: "now",
        halfAMinute: "30s",
        lessThanXMinutes: `${count}m`,
        xMinutes: `${count}m`,
        aboutXHours: `${count}hr`,
        xHours: `${count}hr`,
        xDays: `${count}d`,
        aboutXMonths: `${count}mo`,
        xMonths: `${count}mo`,
        aboutXYears: `${count}y`,
        xYears: `${count}y`,
        overXYears: `${count}y`,
        almostXYears: `${count}y`,
      };
      return units[token] || `${count}u`;
    },
  };

  return (
    <div className="w-full flex justify-center  py-6">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {!feeds
          ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          : feeds?.data?.map((feed) => (
              <div
                key={feed._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-3 items-center">
                    <img
                      className="h-10 w-10 rounded-full object-cover border cursor-pointer"
                      src={feed.owner.avatar}
                      alt="avatar"
                    />

                    <div className="flex flex-row gap-1 items-center text-sm">
                      <h3 className="font-semibold cursor-pointer">
                        {feed.owner.userName}
                      </h3>
                      <span className="text-gray-400">&#x2022;</span>
                      <p className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(feed.createdAt), {
                          locale: shortLocale,
                        })}
                      </p>
                    </div>
                  </div>

                  <button className="text-gray-500 hover:text-black transition cursor-pointer">
                    <i className="fa-solid fa-ellipsis"></i>
                  </button>
                </div>

                {/* Image */}
                <div
                  className="w-full rounded-lg overflow-hidden relative cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(feed._id, feed.isLiked)}
                >
                  <img
                    className="w-full max-h-[500px] object-cover"
                    src={feed.imageFile}
                    alt=""
                  />

                  {/* Heart Animation */}
                  {showHeart  === feed._id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-heart text-red-500 text-6xl animate-ping"></i>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row justify-between items-center text-sm">
                  <div className="flex flex-row gap-4">
                    <span
                      className="cursor-pointer transition"
                      onClick={()=>handlePostLike(feed._id)}
                    >
                      <i
                        className={
                          // likedPosts[feed._id]
                          feed.isLiked
                            ? "fa-solid fa-heart text-red-500"
                            : "fa-regular fa-heart"
                        }
                      ></i>{" "}
                      {feed.likesCount}
                    </span>

                    <span
                      className="cursor-pointer hover:text-blue-500 transition"
                      onClick={() => setSelectedPost(feed)}
                    >
                      <i className="fa-regular fa-comment"></i>{" "}
                      {feed.commentsCount}
                    </span>

                    <span className="cursor-pointer hover:text-green-500 transition">
                      <i className="fa-regular fa-paper-plane"></i>
                    </span>
                  </div>

                  <span className="cursor-pointer hover:text-yellow-500 transition">
                    <i className="fa-regular fa-bookmark"></i>
                  </span>
                </div>

                {/* Caption */}
                <div className="text-sm leading-relaxed">
                  <p>
                    <span className="font-semibold mr-1">
                      {feed.owner.userName}
                    </span>
                    {feed.caption}
                  </p>
                </div>
              </div>
            ))}
      </div>
      <div>
        {selectedPost && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 ">
            {/* Modal Container */}
            <div
              className="bg-white w-[90%] max-w-5xl h-[80vh] rounded-xl overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEFT - IMAGE */}
              <div className="w-1/2 bg-black flex items-center justify-center">
                <img
                  src={selectedPost.imageFile}
                  alt=""
                  className="max-h-full object-contain"
                />
              </div>

              {/* RIGHT - COMMENTS */}
              <div className="w-1/2 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPost.owner.avatar}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="font-semibold">
                      {selectedPost.owner.userName}
                    </span>
                  </div>

                  <button
                    className="cursor-pointer"
                    onClick={() => setSelectedPost(null)}
                  >
                    ✖
                  </button>
                </div>

                {/* COMMENTS LIST */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-sm">
                  {/* Caption */}
                  <div className="flex gap-2">
                    <span className="font-semibold">
                      {selectedPost.owner.userName}
                    </span>
                    <span>{selectedPost.caption}</span>
                  </div>

                  {/* Example Comments */}
                  <div>
                    {selectedPost?.comments.map((comment) => (
                      <div
                        className="flex flex-col justify-center gap-1 w-full"
                        key={comment._id}
                      >
                        <div className="flex flex-row items-center w-full gap-3">
                          <img
                            className="h-8 w-8 rounded-full "
                            src={comment.owner.avatar}
                            alt="user avatar"
                          />
                          <div className="flex flex-row items-center justify-between  w-full gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold ">
                                {comment.owner.userName}
                              </span>
                              <span>{comment.content}</span>
                            </div>
                            <span className="cursor-pointer transition"
                            onClick={()=>handleCommentLike(comment._id)}>
                              <i
                                className={
                                  // likedPosts[comment._id]
                                  comment.isLiked
                                    ? "fa-solid fa-heart text-red-500"
                                    : "fa-regular fa-heart"
                                }
                              ></i>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 text-xs ml-11">
                          <p>
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              locale: shortLocale,
                            })}
                          </p>
                          <span>{comment.likesCount} likes</span>
                          <span>Reply</span>
                        </div>
                        <div className="ml-11 text-gray-500 text-xs flex flex-row gap-3">
                          <span>
                            <i class="fa-solid fa-minus"></i>
                          </span>
                          <span>View replies</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="p-4 border-t flex flex-col gap-2">
                  <div className="flex gap-4 text-lg">
                    <i className="fa-regular fa-heart cursor-pointer"></i>
                    <i className="fa-regular fa-comment cursor-pointer"></i>
                    <i className="fa-regular fa-paper-plane cursor-pointer"></i>
                  </div>

                  <div className="text-sm font-semibold">
                    <p>{selectedPost.likesCount} likes</p>
                    <p>
                      {formatDistanceToNow(new Date(selectedPost.createdAt), {
                        locale: shortLocale,
                      })}
                    </p>
                  </div>

                  {/* Add Comment */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 border rounded-full px-3 py-2 text-sm outline-none"
                    />
                    <button className="text-blue-500 font-medium">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
