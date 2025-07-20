import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const getUrlParam = (param, fallback = '') => urlParams.get(param) || fallback;

    setSidebarData({
      searchTerm: getUrlParam('searchTerm'),
      type: getUrlParam('type', 'all'),
      parking: getUrlParam('parking') === 'true',
      furnished: getUrlParam('furnished') === 'true',
      offer: getUrlParam('offer') === 'true',
      sort: getUrlParam('sort', 'created_at'),
      order: getUrlParam('order', 'desc'),
    });

    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
        const data = await res.json();
        setListings(data);
        setShowMore(data.length > 8);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;

    if (['all', 'rent', 'sale'].includes(id)) {
      setSidebarData((prev) => ({ ...prev, type: id }));
    } else if (id === 'searchTerm') {
      setSidebarData((prev) => ({ ...prev, searchTerm: value }));
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setSidebarData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setSidebarData((prev) => ({ ...prev, sort, order }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    for (const key in sidebarData) {
      urlParams.set(key, sidebarData[key]);
    }

    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', listings.length);

    try {
      const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();
      setListings((prev) => [...prev, ...data]);
      if (data.length < 9) setShowMore(false);
    } catch (error) {
      console.error('Failed to fetch more listings:', error);
    }
  };

  return (
    <div className='flex flex-col md:flex-row bg-slate-900 min-h-screen text-white'>
      {/* Sidebar */}
      <div className='p-6 bg-slate-800 shadow-md rounded-xl border border-slate-700 md:min-h-screen md:w-80'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <h2 className='text-2xl font-semibold text-white'>Filters</h2>

          {/* Search Term */}
          <div className='flex flex-col gap-2'>
            <label className='text-slate-300 font-medium'>Search Term</label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Enter keywords...'
              className='border border-slate-700 p-3 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-500'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className='flex flex-col gap-2'>
            <label className='text-slate-300 font-medium'>Type</label>
            <div className='flex gap-4'>
              {['all', 'rent', 'sale'].map((typeOption) => (
                <div key={typeOption} className='flex items-center gap-1'>
                  <input
                    type='checkbox'
                    id={typeOption}
                    onChange={handleChange}
                    checked={sidebarData.type === typeOption}
                    className='accent-green-500 w-4 h-4'
                  />
                  <span className='text-slate-300 text-sm'>
                    {typeOption === 'all' ? 'Rent & Sale' : typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className='flex flex-col gap-2'>
            <label className='text-slate-300 font-medium'>Amenities</label>
            <div className='flex gap-4'>
              {['parking', 'furnished'].map((amenity) => (
                <div key={amenity} className='flex items-center gap-1'>
                  <input
                    type='checkbox'
                    id={amenity}
                    onChange={handleChange}
                    checked={sidebarData[amenity]}
                    className='accent-green-500 w-4 h-4'
                  />
                  <span className='text-slate-300 text-sm'>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                </div>
              ))}
              <div className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  id='offer'
                  onChange={handleChange}
                  checked={sidebarData.offer}
                  className='accent-green-500 w-4 h-4'
                />
                <span className='text-slate-300 text-sm'>Offer</span>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className='flex flex-col gap-2'>
            <label className='text-slate-300 font-medium'>Sort</label>
            <select
              id='sort_order'
              onChange={handleChange}
              value={`${sidebarData.sort}_${sidebarData.order}`}
              className='border border-slate-700 bg-slate-900 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500'
            >
              <option value='regularPrice_desc'>Price High to Low</option>
              <option value='regularPrice_asc'>Price Low to High</option>
              <option value='created_at_desc'>Newest</option>
              <option value='created_at_asc'>Oldest</option>
            </select>
          </div>

          {/* Search Button */}
          <button className='bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg uppercase tracking-wide transition'>
            Search
          </button>
        </form>
      </div>

      {/* Listings */}
      <div className='flex-1 p-6'>
        <h1 className='text-3xl font-bold text-white mb-6'>Listing Results</h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-400 col-span-full text-center'>No listings found!</p>
          )}

          {loading && (
            <p className='text-xl text-slate-400 col-span-full text-center'>Loading...</p>
          )}

          {!loading && listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
        </div>

        {showMore && (
          <div className='flex justify-center mt-8'>
            <button
              onClick={onShowMoreClick}
              className='bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition'
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
