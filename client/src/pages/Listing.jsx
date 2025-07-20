import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import Contact from "../components/Contact";

SwiperCore.use([Navigation]);

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [feekback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.user);

  const [rating, setRating] = useState(0); // selected rating
  const [hover, setHover] = useState(0); // for hover effect
  const [comment, setComment] = useState("");

  // console.log("Token:", token);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    const amountToPay = listing.regularPrice * 100;
    console.log("Amount to pay:", amountToPay);

    console.log("token:", token);
    try {
      const orderRes = await fetch("http://localhost:3000/api/user/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ amount: amountToPay }),
      });

      const orderData = await orderRes.json();
      console.log("Order data:", orderData);

      const options = {
        key: "rzp_test_wDliOlkvtU4cdh", 
        amount: amountToPay,
        currency: "INR",
        name: "Your Company Name",
        description: "Purchase Listing",
        order_id: orderData.id,
        handler: async function (response) {
          console.log("Payment response:", response);
          console.log("mytoken:", token);
          const verifyRes = await fetch(
            "http://localhost:3000/api/user/verifyOrder",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                listingId: listing._id,
              }),
            }
          );

          const verifyData = await verifyRes.json();
          alert(verifyData.message);
        },
        prefill: {
          name: currentUser.username,
          email: currentUser.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed.");
    }
  };

  // Fetch listing data
  useEffect(() => {
    const fetchFeedBackListing = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/auth/feedback/listing/${params.listingId}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        const data = await res.json();
        console.log("Feedback data:", data);
        if (data.success === false) {
          setError(true);
          return;
        }
        setFeedback(data);
      } catch (error) {
        setError(true);
      }
    };
    fetchFeedBackListing();
  }, [params.listingId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/user/feedback/listing/${params.listingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            rating: rating,
            content: comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      const data = await response.json();
      console.log("Feedback submitted:", data);

      setRating(0);
      setComment("");
      setFeedback((prevFeedback) => [...prevFeedback, data]);
      alert("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  

  // Fetch listing data

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-300">
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl text-red-500">
          Something went wrong!
        </p>
      )}
      {listing && !loading && !error && (
        <div className="relative">
          {/* Swiper */}
          <Swiper navigation className="rounded-3xl overflow-hidden shadow-2xl">
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div className="relative w-full max-w-[1100px] mx-auto h-[400px] sm:h-[600px] mt-4 overflow-hidden rounded-xl shadow-md">
                  <img
                    src={url}
                    alt="Property"
                    onError={() => console.error('Image load error:', url)}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <h2 className="text-4xl font-bold">{listing.name}</h2>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-[13%] right-[3%] z-10 border border-gray-700 shadow-md rounded-full w-12 h-12 flex justify-center items-center bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
          >
            <FaShare
              className="text-gray-300"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            />
          </motion.div>

          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-gray-700 text-white p-2 text-xs shadow-md">
              Link copied!
            </p>
          )}

          {/* Listing Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-6xl mx-auto p-6 my-12 bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl space-y-10"
          >
            {/* Title & Price */}
            <div className="space-y-4">
              <p className="text-4xl font-extrabold text-white">
                {listing.name}{" "}
              </p>
              <p className="text-3xl text-indigo-400">
                ₹{" "}
                {listing.offer
                  ? listing.discountPrice.toLocaleString("hi-IN")
                  : listing.regularPrice.toLocaleString("hi-IN")}
                {listing.type === "rent" && " / month"}
              </p>
            </div>
            {currentUser && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePayment}
                className="w-full bg-green-600 hover:bg-green-700 transition text-white py-4 rounded-lg font-semibold text-lg shadow-md mt-4"
              >
                Buy Now
              </motion.button>
            )}

            {/* Address */}
            <p className="flex items-center gap-2 text-gray-400 text-md">
              <FaMapMarkerAlt className="text-red-500" />
              {listing.address}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-4">
              <p className="bg-indigo-600 text-white py-1 px-4 rounded-full text-xs font-semibold shadow-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-600 text-white py-1 px-4 rounded-full text-xs font-semibold shadow-md">
                  ₹
                  {(
                    +listing.regularPrice - +listing.discountPrice
                  ).toLocaleString("en-US")}{" "}
                  OFF
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-white text-2xl font-bold">
                Property Description
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Features */}
            <ul className="flex flex-wrap gap-8 text-gray-300 font-medium text-sm">
              <li className="flex items-center gap-2">
                <FaBed className="text-xl text-indigo-400" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} Beds`
                  : `${listing.bedrooms} Bed`}
              </li>
              <li className="flex items-center gap-2">
                <FaBath className="text-xl text-indigo-400" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Baths`
                  : `${listing.bathrooms} Bath`}
              </li>
              <li className="flex items-center gap-2">
                <FaParking className="text-xl text-indigo-400" />
                {listing.parking ? "Parking Available" : "No Parking"}
              </li>
              <li className="flex items-center gap-2">
                <FaChair className="text-xl text-indigo-400" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>

            {/* Contact Button */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setContact(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-4 rounded-lg font-semibold text-lg shadow-md"
              >
                Contact Landlord
              </motion.button>
            )}
            {contact && <Contact listing={listing} />}
          </motion.div>
          {/* // feedback section */}

          <div className="max-w-6xl mx-auto p-6 my-12 bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl space-y-10">
            <h3 className="text-white text-2xl font-bold">Feedback</h3>
            <p className="text-gray-400 leading-relaxed">
              We value your feedback! Please share your thoughts about this
              listing.
            </p>

            {/* Star Rating */}
            <div className="flex space-x-1">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <svg
                    key={index}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                    className={`w-8 h-8 cursor-pointer ${
                      starValue <= (hover || rating)
                        ? "fill-yellow-400"
                        : "fill-gray-500"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.853L19.335 24 12 20.013 4.665 24 6 15.601 0 9.748l8.332-1.73z" />
                  </svg>
                );
              })}
            </div>

            {/* Comment Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <textarea
                className="w-full p-4 bg-gray-800 text-gray-300 rounded-lg shadow-md"
                rows="4"
                placeholder="Write your feedback here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-4 rounded-lg font-semibold text-lg shadow-md"
              >
                Submit Feedback
              </button>
            </form>
          </div>
          {/* Feedback List */}
          <div className="max-w-6xl mx-auto p-6 my-12 bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl space-y-10">
            <h3 className="text-white text-2xl font-bold">Users Reviews</h3>
            {feekback.length > 0 ? (
              feekback.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md mb-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={feedback.userId.avatar}
                      alt={feedback.userId.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {feedback.userId.username}
                      </p>
                      <p className="text-yellow-400">
                        {Array.from({ length: feedback.rating }, (_, index) => (
                          <span key={index}>⭐</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-2">{feedback.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No feedback available.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
