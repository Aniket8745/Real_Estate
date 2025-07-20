
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  SwiperCore.use([Navigation, Autoplay]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const [offersRes, rentRes, saleRes] = await Promise.all([
          fetch('https://real-estate-58jo.onrender.com/api/listing/get?offer=true&limit=8'),
          fetch('https://real-estate-58jo.onrender.com/api/listing/get?type=rent&limit=8'),
          fetch('https://real-estate-58jo.onrender.com/api/listing/get?type=sale&limit=8')
        ]);
        
        const [offers, rent, sale] = await Promise.all([
          offersRes.json(),
          rentRes.json(),
          saleRes.json()
        ]);

        setOfferListings(offers);
        setRentListings(rent);
        setSaleListings(sale);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 py-24 px-4 lg:px-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Find Your <span className="text-blue-400">Perfect</span> Space
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mb-8">
              Premium real estate in the most exclusive locations. Curated properties for discerning clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={'/search'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition duration-300 shadow-lg text-center"
              >
                Explore Properties
              </Link>
              <Link
                to={'/about'}
                className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-medium transition duration-300 text-center"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Properties</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Swiper 
            navigation 
            autoplay={{ delay: 5000 }}
            loop={true}
            className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
          >
            {offerListings.length > 0 ? (
              offerListings.map((listing) => (
                <SwiperSlide key={listing._id}>
                  <div className="relative h-[32rem]">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${listing.imageUrls[0]})` }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    </div>
                    <div className="relative h-full flex items-end p-8">
                      <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl max-w-xl border border-gray-700">
                        <span className="inline-block bg-blue-900/50 text-blue-400 text-xs px-3 py-1 rounded-full uppercase font-semibold tracking-wide mb-3 border border-blue-800">
                          Featured
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-3">{listing.name}</h3>
                        <p className="text-gray-400 mb-4">{listing.address}</p>
                        <div className="flex items-center mb-6">
                          <span className="text-blue-400 font-bold text-xl">
                          ₹{listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
                          </span>
                          {listing.type === 'rent' && (
                            <span className="text-gray-500 ml-2">/ month</span>
                          )}
                        </div>
                        <Link
                          to={`/listing/${listing._id}`}
                          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300 w-full"
                        >
                          View Details
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="h-96 flex items-center justify-center bg-gray-800">
                  <p className="text-gray-500">No featured properties available</p>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        )}
      </div>

      {/* Property Listings */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse border border-gray-700">
                  <div className="h-60 bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {rentListings.length > 0 && (
                <ListingSection
                  title="Luxury Rentals"
                  subtitle="Exquisite homes for your temporary stay"
                  link="/search?type=rent"
                  listings={rentListings}
                />
              )}
              
              {saleListings.length > 0 && (
                <ListingSection
                  title="Premium Properties"
                  subtitle="Own a piece of excellence"
                  link="/search?type=sale"
                  listings={saleListings}
                />
              )}
              
              {offerListings.length > 0 && (
                <ListingSection
                  title="Exclusive Offers"
                  subtitle="Special deals for our valued clients"
                  link="/search?offer=true"
                  listings={offerListings}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-24 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Begin Your Property Journey?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Our concierge-level service ensures a seamless experience from search to settlement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition duration-300 shadow-lg"
            >
              Schedule Consultation
            </Link>
            <Link
              to="/listings"
              className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-medium transition duration-300"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingSection({ title, subtitle, link, listings }) {
  return (
    <div className="mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <Link
          to={link}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
        >
          View all
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all border border-gray-700 hover:border-blue-500">
            <div className="relative h-60 overflow-hidden rounded-t-3xl">
             <img
               src={listing.imageUrls[0]}
               alt={listing.name}
              className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative p-6">
              <h3 className="text-xl font-bold text-white mb-2">{listing.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{listing.address}</p>
              <div className="flex items-center mb-4">
                <span className="text-blue-400 font-bold text-xl">
                ₹{listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
                </span>
                {listing.type === 'rent' && (
                  <span className="text-gray-500 ml-2">/ month</span>
                )}
              </div>
              <Link
                to={`/listing/${listing._id}`}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300 w-full text-center"
              >
                View Details
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
