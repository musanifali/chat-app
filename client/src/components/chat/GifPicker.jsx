import React, { useState, useEffect, useRef, useCallback } from 'react';

const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY'; // Will use demo key for now
const GIPHY_DEMO_KEY = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh'; // Public demo key

const GifPicker = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);
  const observerRef = useRef(null);
  const lastGifRef = useRef(null);

  // Load trending GIFs on mount
  useEffect(() => {
    fetchTrendingGifs(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (searchQuery.trim()) {
            searchGifs(searchQuery, false);
          } else {
            fetchTrendingGifs(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (lastGifRef.current) {
      observer.observe(lastGifRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, searchQuery, offset]);

  const fetchTrendingGifs = async (reset = false) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_DEMO_KEY}&limit=50&offset=${currentOffset}&rating=g`
      );
      const data = await response.json();
      
      if (reset) {
        setGifs(data.data);
        setOffset(50);
      } else {
        setGifs(prev => [...prev, ...data.data]);
        setOffset(prev => prev + 50);
      }
      
      setHasMore(data.pagination.total_count > currentOffset + data.data.length);
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query, reset = false) => {
    if (!query.trim()) {
      fetchTrendingGifs(true);
      return;
    }

    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_DEMO_KEY}&q=${encodeURIComponent(query)}&limit=50&offset=${currentOffset}&rating=g`
      );
      const data = await response.json();
      
      if (reset) {
        setGifs(data.data);
        setOffset(50);
      } else {
        setGifs(prev => [...prev, ...data.data]);
        setOffset(prev => prev + 50);
      }
      
      setHasMore(data.pagination.total_count > currentOffset + data.data.length);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setOffset(0);
    setHasMore(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchGifs(query, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* GIF Picker Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-2xl max-h-[80vh] flex flex-col animate-comic-pop"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b-4 border-black flex items-center justify-between"
          style={{ backgroundColor: '#FFD700' }}
        >
          <h3 className="text-xl font-black uppercase">🎬 GIF Picker</h3>
          <button
            onClick={onClose}
            className="text-2xl font-black hover:scale-110 transition-transform"
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: '2px solid black',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              boxShadow: '2px 2px 0 black',
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search GIFs..."
            className="w-full px-4 py-2 text-base font-bold"
            style={{
              border: '3px solid black',
              borderRadius: '12px',
              backgroundColor: 'white',
            }}
            autoFocus
          />
        </div>

        {/* GIF Grid */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#FFD700 #f0f0f0',
            maxHeight: '60vh',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div 
                  className="text-2xl font-black uppercase animate-bounce"
                  style={{ color: '#FFD700', textShadow: '2px 2px 0 black' }}
                >
                  Loading GIFs... 🎬
                </div>
              </div>
            ) : gifs.length === 0 ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <p className="text-xl font-black uppercase" style={{ color: '#666' }}>
                  No GIFs found 😢
                </p>
              </div>
            ) : (
              gifs.map((gif, index) => (
                <button
                  key={gif.id}
                  ref={index === gifs.length - 1 ? lastGifRef : null}
                  onClick={() => {
                    onSelect(gif.images.fixed_height.url);
                    onClose();
                  }}
                  className="relative overflow-hidden rounded-lg transition-all hover:scale-105 hover:shadow-xl"
                  style={{
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                    aspectRatio: '1',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))
            )}
            {loading && gifs.length > 0 && (
              <div className="col-span-full flex justify-center items-center py-4">
                <div 
                  className="text-lg font-black uppercase animate-pulse"
                  style={{ color: '#FFD700', textShadow: '2px 2px 0 black' }}
                >
                  Loading more... 🎬
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-2 border-t-2 border-black text-center text-xs font-bold"
          style={{ backgroundColor: '#f0f0f0' }}
        >
          Powered by GIPHY
        </div>
      </div>
    </>
  );
};

export default GifPicker;
