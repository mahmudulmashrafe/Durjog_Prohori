import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaArrowRight, FaMoon, FaSun, FaGlobe, FaUser } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Add custom CSS for hiding scrollbar but allowing scrolling
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const Home = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      {/* Header with Language and Dark Mode Toggles */}
      <header className={`fixed top-0 left-0 right-0 ${darkMode ? 'bg-gray-800' : 'bg-primary'} shadow-lg z-50 transition-colors rounded-bl-2xl rounded-br-2xl`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Left side - Brand */}
            <div className="flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                {t('appName')}
              </Link>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="text-white hover:text-gray-200 p-2 rounded-full flex items-center space-x-1"
                aria-label="Toggle Language"
              >
                <FaGlobe className="w-5 h-5" />
                <span className="text-sm font-medium">{language === 'en' ? 'BN' : 'EN'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-white hover:text-gray-200 p-2 rounded-full flex items-center space-x-1"
                aria-label="Toggle Theme"
              >
                {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              </button>

              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-white p-2"
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-center transition-colors`}>
                    <FaUser className={`${darkMode ? 'text-white' : 'text-primary'} text-lg`} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {!isAuthenticated && showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/user/signin"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      {t('login')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add margin-top to account for fixed header and apply scrollable container */}
      <div className="pt-2">
        {/* Scrollable content container with hidden scrollbar */}
        <div className="scrollbar-hide overflow-auto" style={{ height: 'calc(100vh - 4rem)', scrollBehavior: 'smooth' }}>
          {/* Hero Section */}
          <div className="bg-primary text-white rounded-lg">
            <div className="container mx-auto px-4 py-8 md:py-10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">দুর্যোগ প্রহরী</h1>
                  <p className="text-xl mb-4">
                    {language === 'en' 
                      ? 'Your trusted companion during natural disasters' 
                      : 'প্রাকৃতিক দুর্যোগের সময় আপনার বিশ্বস্ত সঙ্গী'}
                  </p>
                  <p className="mb-6">
                    {language === 'en'
                      ? 'We provide real-time alerts, emergency resources, and community support to help you stay safe during natural disasters.'
                      : 'আমরা প্রাকৃতিক দুর্যোগের সময় আপনাকে নিরাপদ রাখতে রিয়েল-টাইম সতর্কতা, জরুরি সংস্থান এবং সম্প্রদায়ের সমর্থন প্রদান করি।'}
                  </p>
                  <div className="flex flex-wrap gap-4 flex-col md:flex-row">
                    <div className="flex gap-4">
                      <Link
                        to="/user/signin"
                        className="group relative bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center space-x-2 overflow-hidden"
                      >
                        <FaUser className="text-lg" />
                        <span>{language === 'en' ? 'Login' : 'লগইন'}</span>
                        <div className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                      </Link>
                      <Link
                        to="/authority/signin"
                        className="group relative bg-[#007fff] text-white hover:bg-[#0066cc] px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center space-x-2"
                      >
                        <FaUser className="text-lg" />
                        <span>{language === 'en' ? 'Authority Login' : 'কর্তৃপক্ষ লগইন'}</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                      </Link>
                    </div>
                    <div className="flex gap-4">
                      <Link
                        to="/firefighter/signin"
                        className="group relative bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center space-x-2"
                      >
                        <FaUser className="text-lg" />
                        <span>{language === 'en' ? 'Firefighter Login' : 'ফায়ারফাইটার লগইন'}</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                      </Link>
                      <Link
                        to="/ngo/signin"
                        className="group relative bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center space-x-2"
                      >
                        <FaUser className="text-lg" />
                        <span>{language === 'en' ? 'NGO Login' : 'এনজিও লগইন'}</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="/images/disaster-preparedness.jpg" 
                    alt="Disaster Preparedness" 
                    className="rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400?text=Disaster+Preparedness';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spacer between Hero and Mission */}
          <div className="h-1 bg-green-50 dark:bg-green-900 bg-opacity-30 dark:bg-opacity-20"></div>

          {/* Mission Section */}
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 dark:text-white">
                {language === 'en' ? 'Our Mission' : 'আমাদের লক্ষ্য'}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
                {language === 'en' 
                  ? 'Our mission is to empower communities with the tools and information they need to prepare for, respond to, and recover from natural disasters. We aim to reduce the impact of disasters through education, early warning systems, and community engagement.'
                  : 'আমাদের লক্ষ্য হল সম্প্রদায়কে প্রাকৃতিক দুর্যোগের জন্য প্রস্তুত হতে, প্রতিক্রিয়া জানাতে এবং পুনরুদ্ধার করতে প্রয়োজনীয় সরঞ্জাম এবং তথ্য দিয়ে ক্ষমতায়ন করা। আমরা শিক্ষা, প্রাথমিক সতর্কতা ব্যবস্থা এবং সম্প্রদায়ের সম্পৃক্ততার মাধ্যমে দুর্যোগের প্রভাব কমাতে চাই।'}
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary text-2xl">1</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">
                    {language === 'en' ? 'Early Warning' : 'প্রাথমিক সতর্কতা'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'en' 
                      ? 'Provide timely alerts about potential disasters' 
                      : 'সম্ভাব্য দুর্যোগ সম্পর্কে সময়মত সতর্কতা প্রদান করা'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary text-2xl">2</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">
                    {language === 'en' ? 'Education' : 'শিক্ষা'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'en' 
                      ? 'Educate communities about disaster preparedness' 
                      : 'দুর্যোগ প্রস্তুতি সম্পর্কে সম্প্রদায়কে শিক্ষিত করা'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary text-2xl">3</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">
                    {language === 'en' ? 'Support' : 'সহায়তা'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'en' 
                      ? 'Provide resources and support during emergencies' 
                      : 'জরুরি অবস্থায় সংস্থান এবং সহায়তা প্রদান করা'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer between Mission and Vision */}
          <div className="h-1 bg-yellow-50 dark:bg-yellow-900 bg-opacity-30 dark:bg-opacity-20"></div>

          {/* Vision Section */}
          <div className="bg-gray-100 dark:bg-gray-800 py-6">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 dark:text-white">
                  {language === 'en' ? 'Our Vision' : 'আমাদের দৃষ্টিভঙ্গি'}
                </h2>
                <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
              </div>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
                  {language === 'en' 
                    ? 'We envision a future where communities are resilient in the face of natural disasters, where loss of life and property is minimized through preparedness, and where recovery is swift and effective.'
                    : 'আমরা এমন একটি ভবিষ্যতের কল্পনা করি যেখানে সম্প্রদায়গুলি প্রাকৃতিক দুর্যোগের মুখে স্থিতিস্থাপক, যেখানে প্রস্তুতির মাধ্যমে জীবন ও সম্পত্তির ক্ষতি কমানো হয় এবং যেখানে পুনরুদ্ধার দ্রুত ও কার্যকর হয়।'}
                </p>
                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
                  <h3 className="font-bold text-xl mb-4 text-center dark:text-white">
                    {language === 'en' ? 'Key Objectives' : 'মূল উদ্দেশ্য'}
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaArrowRight className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="dark:text-gray-200">
                        {language === 'en'
                          ? 'Develop a comprehensive early warning system for all types of natural disasters'
                          : 'সমস্ত ধরনের প্রাকৃতিক দুর্যোগের জন্য একটি ব্যাপক প্রাথমিক সতর্কতা ব্যবস্থা বিকাশ করা'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FaArrowRight className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="dark:text-gray-200">
                        {language === 'en'
                          ? 'Build a community of trained volunteers who can assist during emergencies'
                          : 'প্রশিক্ষিত স্বেচ্ছাসেবকদের একটি সম্প্রদায় গড়ে তোলা যারা জরুরি অবস্থায় সাহায্য করতে পারে'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FaArrowRight className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="dark:text-gray-200">
                        {language === 'en'
                          ? 'Create educational resources to help communities prepare for disasters'
                          : 'সম্প্রদায়কে দুর্যোগের জন্য প্রস্তুত করতে সাহায্য করার জন্য শিক্ষামূলক সংস্থান তৈরি করা'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FaArrowRight className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="dark:text-gray-200">
                        {language === 'en'
                          ? 'Collaborate with government agencies and NGOs to improve disaster response'
                          : 'দুর্যোগ প্রতিক্রিয়া উন্নত করতে সরকারি সংস্থা এবং এনজিওদের সাথে সহযোগিতা করা'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer between Vision and Contact */}
          <div className="h-1 bg-red-50 dark:bg-red-900 bg-opacity-30 dark:bg-opacity-20"></div>

          {/* Contact Section */}
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 dark:text-white">
                {language === 'en' ? 'Contact Us' : 'যোগাযোগ করুন'}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2 bg-primary text-white p-8">
                    <h3 className="text-2xl font-bold mb-6">
                      {language === 'en' ? 'Get In Touch' : 'যোগাযোগ করুন'}
                    </h3>
                    <p className="mb-8">
                      {language === 'en'
                        ? 'Have questions or suggestions? We\'d love to hear from you. Contact us using the information below.'
                        : 'প্রশ্ন বা পরামর্শ আছে? আমরা আপনার কাছ থেকে শুনতে চাই। নিচের তথ্য ব্যবহার করে আমাদের সাথে যোগাযোগ করুন।'}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="mt-1 mr-4 text-xl" />
                        <div>
                          <h4 className="font-bold">{language === 'en' ? 'Address' : 'ঠিকানা'}</h4>
                          <p>United City, Madani Ave, Dhaka 1212</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaEnvelope className="mt-1 mr-4 text-xl" />
                        <div>
                          <h4 className="font-bold">{language === 'en' ? 'Email' : 'ইমেইল'}</h4>
                          <p>durjogprohori@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaPhone className="mt-1 mr-4 text-xl" />
                        <div>
                          <h4 className="font-bold">{language === 'en' ? 'Phone' : 'ফোন'}</h4>
                          <p>+880 1234 567890</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold mb-6 dark:text-white">
                      {language === 'en' ? 'Send a Message' : 'বার্তা পাঠান'}
                    </h3>
                    <form>
                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                          {language === 'en' ? 'Name' : 'নাম'}
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-600 dark:border-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                          id="name"
                          type="text"
                          placeholder={language === 'en' ? 'Your Name' : 'আপনার নাম'}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                          {language === 'en' ? 'Email' : 'ইমেইল'}
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-600 dark:border-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                          id="email"
                          type="email"
                          placeholder={language === 'en' ? 'Your Email' : 'আপনার ইমেইল'}
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="message">
                          {language === 'en' ? 'Message' : 'বার্তা'}
                        </label>
                        <textarea
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-600 dark:border-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                          id="message"
                          rows="4"
                          placeholder={language === 'en' ? 'Your Message' : 'আপনার বার্তা'}
                        ></textarea>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="submit"
                          className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary-dark transition-colors duration-300 shadow-md hover:shadow-lg"
                        >
                          {language === 'en' ? 'Send Message' : 'বার্তা পাঠান'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer between Contact and Footer */}
          <div className="h-1 bg-purple-50 dark:bg-purple-900 bg-opacity-30 dark:bg-opacity-20"></div>

          {/* Footer */}
          <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">দুর্যোগ প্রহরী</h2>
                <p className="mb-4">
                  {language === 'en' 
                    ? 'Your trusted companion during natural disasters' 
                    : 'প্রাকৃতিক দুর্যোগের সময় আপনার বিশ্বস্ত সঙ্গী'}
                </p>
                <p className="text-sm text-gray-400">
                  © 2025 দুর্যোগ প্রহরী. {language === 'en' ? 'All rights reserved.' : 'সর্বস্বত্ব সংরক্ষিত।'}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Include the custom scrollbar hiding styles */}
      <style>{scrollbarHideStyles}</style>
    </div>
  );
};

export default Home; 