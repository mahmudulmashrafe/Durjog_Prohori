import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaEye, FaSync, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { WiSunrise, WiSunset } from 'react-icons/wi';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

// Weather API configuration
const WEATHER_API_KEY = 'fe81969cb6cd4c43a49134319252806';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

// Add this style to your global CSS file or create a new CSS file and import it
// For now adding directly for demo purposes
const scrollbarHideStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    -webkit-overflow-scrolling: touch;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

const Dashboard = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  
  // Weather state
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [showAllForecast, setShowAllForecast] = useState(false);

  // Initial data fetch on component mount
  useEffect(() => {
    // Use the exact coordinates from the working API call
    const exactCoordinates = {
      latitude: 23.871875891197494,
      longitude: 90.41150655543817
    };
    
    // Pro+ tier allows for 14 days of forecast data
    const directUrl = `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${exactCoordinates.latitude},${exactCoordinates.longitude}&days=10&aqi=yes&alerts=yes`;

    // Use fetch instead of axios as it might handle the response differently
    fetch(directUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Weather data received:', data);
        console.log('Number of forecast days:', data.forecast?.forecastday?.length);
        setWeather(data);
        setLocation({ latitude: exactCoordinates.latitude, longitude: exactCoordinates.longitude });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching weather data:', err);
        setError(language === 'en' 
          ? 'Unable to fetch weather data. Please try again.' 
          : 'আবহাওয়া তথ্য আনতে অক্ষম। অনুগ্রহ করে আবার চেষ্টা করুন।');
          setLoading(false);
      });
  }, [language]);

  // Refresh weather data
  const handleRefresh = () => {
    setLoading(true);
    if (location) {
      // Request 10 days of forecast data
      const url = `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${location.latitude},${location.longitude}&days=10&aqi=yes&alerts=yes`;
      
      fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log('Refreshed weather data:', data);
          console.log('Number of forecast days after refresh:', data.forecast?.forecastday?.length);
          setWeather(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error refreshing weather data:', err);
          setError(language === 'en' 
            ? 'Unable to refresh weather data. Please try again.' 
            : 'আবহাওয়া তথ্য রিফ্রেশ করতে অক্ষম। অনুগ্রহ করে আবার চেষ্টা করুন।');
          setLoading(false);
        });
      }
    };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'bn-BD', options);
  };

  // Get day name
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short' });
    };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">{language === 'en' ? 'Loading weather data...' : 'আবহাওয়া তথ্য লোড হচ্ছে...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">{language === 'en' ? 'Weather Data Error' : 'আবহাওয়া তথ্য ত্রুটি'}</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {language === 'en' ? 'Try Again' : 'আবার চেষ্টা করুন'}
          </button>
        </div>
      </div>
    );
  }

  // If weather data is loaded successfully
  if (weather) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Apply scrollable container for the entire content */}
        <div className="hide-scrollbar overflow-auto" style={{ height: 'calc(100vh - 4rem)', scrollBehavior: 'smooth' }}>
          {/* Location and time */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-600 dark:text-gray-400" />
              <span>{weather.location?.name || 'Unknown Location'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Last updated: ' : 'সর্বশেষ আপডেট: '}
                {formatDate(weather.current?.last_updated) || 'Unknown'} 
              </span>
              <button 
                onClick={handleRefresh} 
                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FaSync className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Current weather */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 mx-4 p-6 mb-4 transform transition-all hover:shadow-xl">
            <div className="text-xl font-medium mb-2">{language === 'en' ? 'Now' : 'এখন'}</div>
            <div className="flex justify-between">
              <div>
                <div className="text-6xl font-light mb-1">{Math.round(weather.current?.temp_c || 0)}°</div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">{weather.current?.condition?.text || 'Unknown'}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {language === 'en' ? 'Feels like ' : 'অনুভূত হচ্ছে '}
                  {Math.round(weather.current?.feelslike_c || 0)}°
                </div>
                <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                  <div>
                    {language === 'en' ? 'High: ' : 'সর্বোচ্চ: '}
                    {Math.round(weather.forecast?.forecastday?.[0]?.day?.maxtemp_c || 0)}°
                  </div>
                  <span className="mx-2">•</span>
                  <div>
                    {language === 'en' ? 'Low: ' : 'সর্বনিম্ন: '}
                    {Math.round(weather.forecast?.forecastday?.[0]?.day?.mintemp_c || 0)}°
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                {weather.current?.is_day ? (
                  <img 
                    src={weather.current?.condition?.icon?.replace('64x64', '128x128') || ''}
                    alt={weather.current?.condition?.text || 'Weather icon'}
                    className="w-16 h-16"
                  />
                ) : (
                  <img 
                    src={weather.current?.condition?.icon?.replace('64x64', '128x128') || ''}
                    alt={weather.current?.condition?.text || 'Weather icon'}
                    className="w-16 h-16"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Today's forecast */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 mx-4 p-4 mb-4 transform transition-all hover:shadow-xl">
            <div className="text-xl font-medium mb-2">{language === 'en' ? "Today's Forecast" : "আজকের পূর্বাভাস"}</div>
            <div 
              className="overflow-x-auto no-scrollbar"
              style={{ 
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              <style>
                {`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <div className="flex gap-4 pb-2">
                {weather.forecast?.forecastday?.[0]?.hour
                  ?.filter(hour => new Date(hour.time) > new Date())
                  ?.map((hour, index) => {
                    const hourTime = new Date(hour.time);
                    return (
                      <div key={index} className="flex flex-col items-center min-w-[60px] w-[60px]">
                        <div className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">
                          {hourTime.getHours() === 23 ? '23:00' : formatDate(hour.time)}
                        </div>
                        <img 
                          src={hour.condition?.icon || ''} 
                          alt={hour.condition?.text || 'Weather icon'} 
                          className="w-8 h-8 my-1"
                        />
                        <div className="font-medium text-center w-full">{Math.round(hour.temp_c || 0)}°C</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 10-day forecast */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 mx-4 p-4 mb-4 transform transition-all hover:shadow-xl">
            <div className="text-xl font-medium mb-2">{language === 'en' ? "10-Day Forecast" : "১০ দিনের পূর্বাভাস"}</div>
            <div className="space-y-3">
              {weather.forecast?.forecastday?.slice(0, showAllForecast ? undefined : 4).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="w-12 font-medium">
                    {index === 0 
                      ? (language === 'en' ? 'Today' : 'আজ')
                      : getDayName(day.date)}
                  </div>
                  <div className="flex-grow-0 mx-4">
                    <img 
                      src={day.day?.condition?.icon || ''} 
                      alt={day.day?.condition?.text || 'Weather icon'} 
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{Math.round(day.day?.maxtemp_c || 0)}°</span>
                    <span className="mx-1">-</span>
                    <span className="text-gray-600 dark:text-gray-400">{Math.round(day.day?.mintemp_c || 0)}°</span>
                  </div>
                </div>
              ))}
              
              {weather.forecast?.forecastday?.length > 4 && (
                <button 
                  onClick={() => setShowAllForecast(!showAllForecast)} 
                  className="w-full py-2 mt-2 text-blue-500 font-medium flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showAllForecast ? (
                    <>
                      <span>{language === 'en' ? 'Show Less' : 'কম দেখুন'}</span>
                      <FaChevronUp className="ml-1" />
                    </>
                  ) : (
                    <>
                      <span>{language === 'en' ? 'Show More' : 'আরো দেখুন'}</span>
                      <FaChevronDown className="ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Current conditions */}
          <div className="mx-4 mb-4">
            <div className="text-xl font-bold mb-2">{language === 'en' ? "Current conditions" : "বর্তমান অবস্থা"}</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Wind Direction */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 transform transition-all hover:shadow-xl">
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">{language === 'en' ? 'Wind Direction' : 'বাতাসের দিক'}</div>
                <div className="flex items-start">
                  <div>
                    <div className="text-3xl font-bold">{weather.current?.wind_kph || 0}</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400">km/h</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {language === 'en' ? 'Moderate' : 'মাঝারি'} • {language === 'en' ? 'From' : 'থেকে'} {weather.current?.wind_dir || 'N'}
                    </div>
                  </div>
                  <div className="ml-auto relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <div className="text-xs font-bold absolute top-0 transform -translate-y-1/2 text-gray-400">N</div>
                      <div className="text-xs font-bold absolute right-0 transform translate-x-1/2 text-gray-400">E</div>
                      <div className="text-xs font-bold absolute bottom-0 transform translate-y-1/2 text-gray-400">S</div>
                      <div className="text-xs font-bold absolute left-0 transform -translate-x-1/2 text-gray-400">W</div>
                      <div 
                        className="h-2 w-2 bg-blue-500 rounded-full relative z-10"
                        style={{ 
                          transform: `rotate(${weather.current?.wind_degree || 0}deg) translateY(-8px)`,
                          transformOrigin: 'center center' 
                        }}
                      >
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-1 bg-blue-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Humidity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 transform transition-all hover:shadow-xl">
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">{language === 'en' ? 'Humidity' : 'আর্দ্রতা'}</div>
                <div className="flex items-start">
                  <div>
                    <div className="text-3xl font-bold">{weather.current?.humidity || 0}%</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {language === 'en' ? 'Dew point' : 'শিশির বিন্দু'} {Math.round(weather.current?.dewpoint_c || 0)}°
                    </div>
                  </div>
                  <div className="ml-auto relative h-16 w-10">
                    <div className="absolute inset-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <div className="absolute top-0 right-0 left-0 text-xs font-bold text-gray-500 text-center">100</div>
                      <div className="absolute bottom-0 right-0 left-0 text-xs font-bold text-gray-500 text-center">0</div>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-yellow-400 transition-all duration-500"
                        style={{ height: `${weather.current?.humidity || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* UV Index */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 transform transition-all hover:shadow-xl">
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">{language === 'en' ? 'UV Index' : 'ইউভি সূচক'}</div>
                <div className="flex items-start">
                  <div>
                    <div className="text-3xl font-bold">{Math.round(weather.current?.uv || 0)}</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {weather.current?.uv <= 2 
                        ? (language === 'en' ? 'Low' : 'কম')
                        : weather.current?.uv <= 5
                          ? (language === 'en' ? 'Moderate' : 'মাঝারি')
                          : weather.current?.uv <= 7
                            ? (language === 'en' ? 'High' : 'বেশি')
                            : (language === 'en' ? 'Very High' : 'খুব বেশি')}
                    </div>
                  </div>
                  <div className="ml-auto relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute right-0 top-0 text-xs font-bold text-gray-500">11+</div>
                      <div className="absolute left-0 bottom-0 text-xs font-bold text-gray-500">0</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visibility - moved into the grid */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 transform transition-all hover:shadow-xl">
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">{language === 'en' ? 'Visibility' : 'দৃশ্যমানতা'}</div>
                <div className="flex items-start">
                  <div>
                    <div className="text-3xl font-bold">{weather.current?.vis_km || 0}</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400">km</div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {language === 'en' ? 'Clear visibility' : 'পরিষ্কার দৃশ্যমানতা'}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center justify-center h-16 w-16">
                    <FaEye className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sunrise & Sunset */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 mt-4 mx-4 mb-4 transform transition-all hover:shadow-xl">
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4">{language === 'en' ? 'Sunrise & sunset' : 'সূর্যোদয় ও সূর্যাস্ত'}</div>
            
            {/* For larger screens */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center">
                <WiSunrise className="h-8 w-8 text-yellow-500 mr-1" />
                <div className="text-md font-bold">
                  {weather.forecast?.forecastday?.[0]?.astro?.sunrise || '05:16 AM'}
                </div>
              </div>
              
              <div className="flex-1 mx-4 relative h-12 my-4">
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                
                <div className="absolute left-1/4 -bottom-7 text-xs font-bold text-gray-500">
                  4:46 AM
                </div>
                <div className="absolute right-1/4 -bottom-7 text-xs font-bold text-gray-500">
                  7:04 PM
                </div>
                
                <div className="absolute left-1/4 top-2 text-xs font-bold text-gray-500">{language === 'en' ? 'Dawn' : 'ভোর'}</div>
                <div className="absolute right-1/4 top-2 text-xs font-bold text-gray-500">{language === 'en' ? 'Dusk' : 'সন্ধ্যা'}</div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 h-8 w-16 bg-blue-400 rounded-full"></div>
              </div>
              
              <div className="flex items-center">
                <div className="text-md font-bold">
                  {weather.forecast?.forecastday?.[0]?.astro?.sunset || '06:34 PM'}
                </div>
                <WiSunset className="h-8 w-8 text-orange-500 ml-1" />
              </div>
            </div>
            
            {/* For mobile screens */}
            <div className="sm:hidden">
              <div className="flex justify-between mb-6">
                <div className="flex items-center">
                  <WiSunrise className="h-7 w-7 text-yellow-500 mr-1" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{language === 'en' ? 'Sunrise' : 'সূর্যোদয়'}</div>
                    <div className="text-md font-bold">
                      {weather.forecast?.forecastday?.[0]?.astro?.sunrise || '05:16 AM'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium text-right">{language === 'en' ? 'Sunset' : 'সূর্যাস্ত'}</div>
                    <div className="text-md font-bold text-right">
                      {weather.forecast?.forecastday?.[0]?.astro?.sunset || '06:34 PM'}
                    </div>
                  </div>
                  <WiSunset className="h-7 w-7 text-orange-500 ml-1" />
                </div>
              </div>
              
              <div className="relative h-16 mb-4">
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                
                <div className="absolute left-1/4 bottom-0 text-xs font-bold text-gray-500">
                  4:46 AM
                </div>
                <div className="absolute right-1/4 bottom-0 text-xs font-bold text-gray-500">
                  7:04 PM
                </div>
                
                <div className="absolute left-1/4 top-0 text-xs font-bold text-gray-500">{language === 'en' ? 'Dawn' : 'ভোর'}</div>
                <div className="absolute right-1/4 top-0 text-xs font-bold text-gray-500">{language === 'en' ? 'Dusk' : 'সন্ধ্যা'}</div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 h-8 w-14 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Add bottom padding for better scrolling experience */}
          <div className="h-6"></div>
        </div>
        
        {/* Include the custom scrollbar hiding styles */}
        <style>{scrollbarHideStyles}</style>
      </div>
    );
  }

  // Fallback if no data is available
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="text-center">
        <div className="text-xl">
          {language === 'en' ? 'No weather data available' : 'কোন আবহাওয়া তথ্য পাওয়া যায়নি'}
        </div>
        <button 
          onClick={handleRefresh} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {language === 'en' ? 'Refresh' : 'রিফ্রেশ করুন'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 