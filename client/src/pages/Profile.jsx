
import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => setFileUploadError(true),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => 
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUser.token}`, },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
      headers: {
        Authorization: `Bearer ${currentUser.token}`,
      },
    });
      
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-300 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-white">Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover mx-auto cursor-pointer hover:scale-105 transition"
          />
          <p className="text-center text-sm">
            {fileUploadError ? (
              <span className="text-red-500">Error uploading image (Max 2MB)</span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className="text-yellow-400">{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className="text-green-500">Image uploaded!</span>
            ) : (
              ''
            )}
          </p>

          <input
            type="text"
            placeholder="Username"
            defaultValue={currentUser.username}
            id="username"
            onChange={handleChange}
            className="bg-gray-800 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            id="email"
            defaultValue={currentUser.email}
            onChange={handleChange}
            className="bg-gray-800 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="New Password"
            onChange={handleChange}
            id="password"
            className="bg-gray-800 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 transition p-4 rounded-xl text-white font-bold uppercase tracking-wider disabled:opacity-70"
          >
            {loading ? 'Loading...' : 'Update'}
          </button>

          <Link
            to="/create-listing"
            className="text-center bg-green-600 hover:bg-green-700 transition p-4 rounded-xl text-white font-bold uppercase tracking-wider"
          >
            Create New Listing
          </Link>
        </form>

        <div className="flex justify-between items-center text-sm mt-4">
          <span
            onClick={handleDeleteUser}
            className="text-red-500 cursor-pointer hover:underline"
          >
            Delete Account
          </span>
          <span
            onClick={handleSignOut}
            className="text-red-500 cursor-pointer hover:underline"
          >
            Sign Out
          </span>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {updateSuccess && (
          <p className="text-green-500 text-center mt-4">Profile updated successfully!</p>
        )}

        <button
          onClick={handleShowListings}
          className="w-full mt-8 text-green-500 hover:underline text-center"
        >
          Show My Listings
        </button>
        {showListingsError && (
          <p className="text-red-500 text-center mt-2">Error showing listings</p>
        )}

        {userListings.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-center text-white">Your Listings</h2>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-2xl shadow-lg hover:scale-105 transition"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </Link>
                <Link
                  to={`/listing/${listing._id}`}
                  className="flex-1 text-white font-semibold hover:underline truncate"
                >
                  {listing.name}
                </Link>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className="text-xs text-red-500 hover:underline uppercase"
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className="text-xs text-green-500 hover:underline uppercase">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


