
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('https://real-estate-58jo.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className='bg-gray-900 min-h-screen flex justify-center items-center'>
      <div className='bg-white p-8 rounded-xl shadow-lg w-full sm:max-w-md'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-8'>
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          {/* Username Input */}
          <div>
            <label htmlFor='username' className='block text-lg font-medium text-gray-700'>
              Username
            </label>
            <input
              type='text'
              id='username'
              placeholder='Enter your username'
              className='w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
              onChange={handleChange}
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor='email' className='block text-lg font-medium text-gray-700'>
              Email
            </label>
            <input
              type='email'
              id='email'
              placeholder='Enter your email'
              className='w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
              onChange={handleChange}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor='password' className='block text-lg font-medium text-gray-700'>
              Password
            </label>
            <input
              type='password'
              id='password'
              placeholder='Enter your password'
              className='w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
              onChange={handleChange}
            />
          </div>

          {/* Sign Up Button */}
          <button
            type='submit'
            disabled={loading}
            className='bg-blue-600 text-white p-4 rounded-lg uppercase hover:bg-blue-700 disabled:opacity-50 transition-all'
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* OAuth Section */}
        <div className='mt-6'>
          <OAuth />
        </div>

        {/* Sign In Link */}
        <div className='text-center mt-4'>
          <p className='text-gray-600'>Already have an account?</p>
          <Link to='/sign-in' className='text-blue-600 hover:underline'>
            Sign In
          </Link>
        </div>

        {/* Error Handling */}
        {error && <p className='text-red-500 text-center mt-4'>{error}</p>}
      </div>
    </div>
  );
}
