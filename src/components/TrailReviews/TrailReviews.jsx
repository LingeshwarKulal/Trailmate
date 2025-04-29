import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TrailReviews() {
  const { trailId } = useParams();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    date: new Date().toISOString(),
    photos: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Mock data for reviews
  const mockReviews = [
    {
      id: 1,
      userId: 'user1',
      userName: 'John Doe',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      title: 'Beautiful Scenic Trail',
      content: 'This trail offers stunning views of the valley and is well-maintained. Perfect for a morning hike!',
      date: '2024-03-19T14:30:00Z',
      photos: ['https://source.unsplash.com/random/800x600?hiking,1'],
      likes: 12,
      helpful: 8
    },
    {
      id: 2,
      userId: 'user2',
      userName: 'Jane Smith',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      rating: 4,
      title: 'Great Family Hike',
      content: 'The trail is relatively easy and perfect for families. The creek crossing was fun for the kids.',
      date: '2024-03-18T09:15:00Z',
      photos: ['https://source.unsplash.com/random/800x600?hiking,2'],
      likes: 8,
      helpful: 5
    },
    {
      id: 3,
      userId: 'user3',
      userName: 'Mike Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      rating: 3,
      title: 'Challenging but Rewarding',
      content: 'The elevation gain is significant, but the views at the top are worth it. Bring plenty of water!',
      date: '2024-03-17T16:45:00Z',
      photos: [],
      likes: 5,
      helpful: 3
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch reviews
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReviews(mockReviews);
        setError(null);
      } catch (err) {
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [trailId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to submit a review.');
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call to submit review
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const review = {
        id: reviews.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar || 'https://i.pravatar.cc/150',
        ...newReview
      };

      setReviews([review, ...reviews]);
      setNewReview({
        rating: 5,
        title: '',
        content: '',
        date: new Date().toISOString(),
        photos: []
      });
      setError(null);
    } catch (err) {
      setError('Failed to submit review. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Write a Review */}
      {currentUser && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`h-8 w-8 ${
                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Review
              </label>
              <textarea
                id="content"
                rows={4}
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
        {reviews.map((review) => (
          <div key={review.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="h-12 w-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{review.userName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <h4 className="mt-2 text-lg font-medium text-gray-900">{review.title}</h4>
                <p className="mt-2 text-gray-600">{review.content}</p>
                {review.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="rounded-lg object-cover h-48 w-full"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {review.likes}
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {review.helpful} found this helpful
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 