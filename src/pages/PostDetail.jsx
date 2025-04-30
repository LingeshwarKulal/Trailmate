import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, increment, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    if (timestamp.toDate) {
      // Firestore timestamp
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } else {
      // Already a date or string
      return timestamp;
    }
  };

  // Fetch post and replies
  useEffect(() => {
    const fetchPostAndReplies = async () => {
      setLoading(true);
      try {
        // Get post data
        const postRef = doc(db, 'forumPosts', postId);
        const postSnap = await getDoc(postRef);
        
        if (!postSnap.exists()) {
          setError("Post not found");
          return;
        }
        
        const postData = {
          id: postSnap.id,
          ...postSnap.data()
        };
        
        setPost(postData);
        
        // Get replies
        const repliesQuery = query(
          collection(db, 'postReplies'),
          where('postId', '==', postId),
          orderBy('createdAt', 'asc')
        );
        
        const repliesSnap = await getDocs(repliesQuery);
        const repliesData = [];
        
        repliesSnap.forEach((doc) => {
          repliesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setReplies(repliesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load the post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      fetchPostAndReplies();
    }
  }, [postId]);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to reply to posts.");
      return;
    }
    
    if (!replyContent.trim()) {
      setError("Reply cannot be empty.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create reply
      const replyData = {
        postId,
        content: replyContent.trim(),
        author: {
          name: user.displayName || 'Anonymous User',
          avatar: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
          uid: user.uid
        },
        createdAt: serverTimestamp(),
        likes: 0
      };
      
      // Add reply to Firestore
      const replyRef = await addDoc(collection(db, 'postReplies'), replyData);
      
      // Update post with incremented reply count
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        replies: increment(1)
      });
      
      // Add reply to local state
      setReplies([
        ...replies,
        {
          id: replyRef.id,
          ...replyData,
          createdAt: 'Just now'
        }
      ]);
      
      // Update post in local state
      setPost({
        ...post,
        replies: post.replies + 1
      });
      
      // Clear the form
      setReplyContent('');
      
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
          Post not found
        </div>
        <Link
          to="/community"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex text-sm text-gray-500">
            <li className="mr-1">
              <Link to="/" className="hover:text-green-600">Home</Link>
            </li>
            <li className="mx-1">/</li>
            <li className="mr-1">
              <Link to="/community" className="hover:text-green-600">Community</Link>
            </li>
            <li className="mx-1">/</li>
            <li className="text-gray-700 font-medium">{post.title}</li>
          </ol>
        </nav>

        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-600 hover:text-green-600"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Community
          </button>
        </div>

        {/* Post Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <img 
              src={post.author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
              alt={post.author?.name || 'Anonymous'}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <div className="font-medium">{post.author?.name || 'Anonymous'}</div>
              <div className="text-sm text-gray-500 flex items-center">
                {post.author?.level && (
                  <>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      {post.author.level}
                    </span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <span>{formatDate(post.createdAt || post.date)}</span>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.replies} {post.replies === 1 ? 'reply' : 'replies'}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {post.likes} {post.likes === 1 ? 'like' : 'likes'}
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Replies ({replies.length})
          </h2>
          
          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No replies yet. Be the first to reply!
            </div>
          ) : (
            <div className="space-y-6">
              {replies.map((reply) => (
                <div key={reply.id} className="flex space-x-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <img
                    src={reply.author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={reply.author?.name || 'Anonymous'}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{reply.author?.name || 'Anonymous'}</span>
                        <span className="text-sm text-gray-500 ml-2">{formatDate(reply.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-gray-700 whitespace-pre-line">{reply.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Leave a Reply</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {!user ? (
            <div className="text-center py-6">
              <p className="mb-4 text-gray-700">You need to sign in to reply to this post.</p>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReplySubmit}>
              <div className="mb-4">
                <label htmlFor="reply" className="sr-only">Your reply</label>
                <textarea
                  id="reply"
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts or ask a question..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 