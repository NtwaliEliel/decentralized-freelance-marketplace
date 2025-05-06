import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Decentralized Freelance Marketplace
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Connect with top freelancers and clients through secure smart contracts.
          No intermediaries, lower fees, and guaranteed payments.
        </p>
        <div className="space-x-4">
          <Link
            to="/jobs"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Find Work
          </Link>
          <Link
            to="/create-job"
            className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition"
          >
            Post a Job
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Secure Payments
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Smart contracts ensure your funds are safe until work is completed.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            No Middlemen
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Direct connection between clients and freelancers means lower fees.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Global Access
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Work with talented professionals from anywhere in the world.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Create Account</h3>
            <p className="text-gray-600 dark:text-gray-300">Connect your wallet to get started</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Post or Find Jobs</h3>
            <p className="text-gray-600 dark:text-gray-300">Browse opportunities or create your own</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Secure Payment</h3>
            <p className="text-gray-600 dark:text-gray-300">Funds held in escrow until completion</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">4</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Complete Work</h3>
            <p className="text-gray-600 dark:text-gray-300">Get paid automatically upon approval</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 