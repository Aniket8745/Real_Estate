
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`https://real-estate-58jo.onrender.com/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  return (
    <>
      {landlord && (
        <div className='max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-8'>
          <h2 className='text-3xl font-semibold text-center text-white'>
            Contact {landlord.username}
          </h2>

          <div className='text-gray-300'>
            <p>
              Reach out to <span className='font-semibold'>{landlord.username}</span> for{' '}
              <span className='font-semibold'>{listing.name.toLowerCase()}</span>
            </p>
            <textarea
              name='message'
              id='message'
              rows='4'
              value={message}
              onChange={onChange}
              placeholder='Enter your message here...'
              className='w-full border bg-gray-800 text-white p-3 rounded-lg mt-4 focus:outline-none'
            ></textarea>

            <div className='flex justify-center mt-6'>
              <Link
                to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
                className='bg-blue-600 text-white text-center py-3 px-6 uppercase rounded-lg hover:opacity-95'
              >
                Send Message
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

