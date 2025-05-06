import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

interface Review {
  id: string;
  rating: number;
  comment: string;
  client: {
    address: string;
    name: string;
  };
  createdAt: string;
}

interface Profile {
  address: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  completedJobs: number;
  rating: number;
  reviews: Review[];
  portfolio: {
    title: string;
    description: string;
    url: string;
  }[];
}

const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWeb3React();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Fetch profile from the backend
        // const response = await axios.get(`/api/profiles/${id}`);
        // setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !profile) return;

    try {
      // TODO: Submit review to the backend
      // await axios.post(`/api/profiles/${profile.address}/reviews`, reviewData);
      setShowReviewForm(false);
      // Refresh profile data
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Profile not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {profile.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {profile.title}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-gray-900 dark:text-white">
                  {profile.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {profile.completedJobs} jobs completed
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ${profile.hourlyRate}/hr
              </span>
            </div>
          </div>
          {account && account !== profile.address && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          About
        </h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {profile.bio}
        </p>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio
        </h2>
        <div className="grid gap-6">
          {profile.portfolio.map((project) => (
            <div
              key={project.url}
              className="border dark:border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {project.description}
              </p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Project →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Reviews
        </h2>
        <div className="space-y-6">
          {profile.reviews.map((review) => (
            <div
              key={review.id}
              className="border-b dark:border-gray-700 last:border-0 pb-6 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {review.client.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    {review.rating}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Write a Review
            </h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Rating
                </label>
                <select
                  id="rating"
                  required
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={reviewData.rating}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, rating: Number(e.target.value) })
                  }
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} {rating === 1 ? 'Star' : 'Stars'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Review
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile; 