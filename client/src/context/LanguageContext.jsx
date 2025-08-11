import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const LanguageContext = createContext();

// Translation data
const translations = {
  en: {
    // App Name
    appName: 'দুর্যোগ প্রহরী',
    
    // Navigation
    map: 'Map',
    alerts: 'Alerts',
    login: 'Login',
    register: 'Register',
    
    // Profile Section
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    notificationPreferences: 'Notification Preferences',
    contactUs: 'Contact Us',
    logout: 'Logout',
    editProfile: 'Edit Profile',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    verifyPhoneNumber: 'Verify Phone Number',
    verifyEmailChange: 'Verify Email Change',
    enterOTP: 'Enter OTP',
    verifyOTP: 'Verify OTP',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    emailContact: 'Email: support@durjogprohori.com',
    addressContact: 'Address: Dhaka, Bangladesh',

    // Weather Dashboard
    temperature: 'Temperature',
    realFeel: 'Real Feel',
    todaysForecast: "Today's Forecast",
    tenDayForecast: '10-Day Forecast',
    humidity: 'Humidity',
    uvIndex: 'UV Index',
    airQuality: 'Air Quality',
    windSpeed: 'Wind Speed',
    windDirection: 'Wind Direction',
    visibility: 'Visibility',
    loadingWeather: 'Loading weather data...',
    locale: 'en-US',
    showMore: 'Show More',
    showLess: 'Show Less',
    currentConditions: 'Current conditions',
    dewPoint: 'Dew point',
    clear: 'Clear visibility',
    good: 'Good visibility',
    limited: 'Limited visibility',
    light: 'Light',
    moderate: 'Moderate',
    strong: 'Strong',
    from: 'From',
    uvLow: 'Low',
    uvModerate: 'Moderate',
    uvHigh: 'High',
    uvVeryHigh: 'Very High',
    uvExtreme: 'Extreme',
    sunriseSunset: 'Sunrise & sunset',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    dawn: 'Dawn',
    dusk: 'Dusk',
    pressure: 'Pressure',
    pressureLow: 'Low',
    pressureNormal: 'Normal',
    pressureHigh: 'High',
    lastUpdated: 'Last updated',
    refresh: 'Refresh',
    now: 'Now',
    feelsLike: 'Feels like',
    high: 'High',
    low: 'Low',
    lightRain: 'Light rain',

    // Alerts
    weatherAlert: 'Weather Alert',
    emergencyAlert: 'Emergency Alert',
    heavyRainfallAlert: 'Heavy rainfall expected in your area',
    flashFloodAlert: 'Flash flood warning in nearby areas',
    hoursAgo: (hours) => `${hours} hours ago`,
    noNotifications: 'No notifications at this time',
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',

    // Map
    mapImplementation: 'Map view will be implemented here',

    // Disaster Types
    disasterMonitor: 'Disaster Monitor',
    earthquake: 'Earthquake',
    earthquakeDesc: 'Monitor seismic activities and earthquake alerts',
    flood: 'Flood',
    floodDesc: 'Track flood warnings and water levels',
    cyclone: 'Cyclone',
    cycloneDesc: 'Monitor cyclone formations and warnings',
    landslide: 'Landslide',
    landslideDesc: 'Track landslide risks and warnings',
    tsunami: 'Tsunami',
    tsunamiDesc: 'Monitor tsunami alerts and warnings',
    fire: 'Fire',
    fireDesc: 'Track fire incidents and warnings',
    other: 'Other',
    otherDesc: 'View other disaster alerts and warnings',

    // SOS
    emergencySOS: 'Emergency SOS',
    nationalEmergency: 'National Emergency Service',
    nationalEmergencyDesc: 'For any emergency situation',
    ambulanceService: 'Ambulance Service',
    ambulanceServiceDesc: '24/7 emergency medical assistance',
    fireService: 'Fire Service',
    fireServiceDesc: 'Fire emergency and rescue service',
    policeHelpline: 'Police Helpline',
    policeHelplineDesc: 'Police emergency assistance',
    shareLocation: 'Share Location',
    gettingLocation: 'Getting Location...',
    currentLocation: 'Your Current Location',
    latitude: 'Latitude',
    longitude: 'Longitude',
    accuracy: 'Accuracy',
    meters: 'meters',
    locationError: 'Location Error',
    geolocationNotSupported: 'Geolocation is not supported by your browser',
    locationPermissionDenied: 'Please allow location access.',
    locationUnavailable: 'Location information is unavailable.',
    locationTimeout: 'Location request timed out.',
    unknownError: 'An unknown error occurred.',
    importantNotes: 'Important Notes',
    stayCalm: 'Stay calm and speak clearly when calling emergency services',
    followInstructions: 'Follow the instructions given by emergency personnel',
    keepPhoneFree: 'Keep your phone line free after making the emergency call',
    sendSOSAlert: 'Send SOS Alert',
    sendingSOSAlert: 'Sending Alert...',
    sosSubmissionSuccess: 'SOS alert sent successfully! Help is on the way.',
    sosSubmissionFailed: 'Failed to send SOS alert. Please try again.',
    fullName: 'Full Name',
    enterYourName: 'Enter your full name',
    phoneNumber: 'Phone Number',
    enterYourPhone: 'Enter your phone number',
    locationRequired: 'Location is required to send an SOS alert.',
    nameRequired: 'Name is required to send an SOS alert.',
    phoneRequired: 'Phone number is required to send an SOS alert.',
    loginRequired: 'You must be logged in to send an SOS alert.',

    // Email Verification
    verifyEmail: 'Verify Your Email',
    verificationCode: 'Verification Code',
    enterVerificationCode: 'Enter verification code',
    verificationCodeSent: "We've sent a verification code to {email}",
    verificationFailed: 'Verification failed. Please try again.',
    verificationCodeResent: 'Verification code has been resent to your email.',
    resendCodeFailed: 'Failed to resend code. Please try again.',
    resendCode: 'Resend Code',
    verifying: 'Verifying...'
  },
  bn: {
    // App Name
    appName: 'দুর্যোগ প্রহরী',
    
    // Navigation
    map: 'মানচিত্র',
    alerts: 'সতর্কতা',
    login: 'লগইন',
    register: 'নিবন্ধন',
    
    // Profile Section
    settings: 'সেটিংস',
    language: 'ভাষা',
    theme: 'থিম',
    notifications: 'বিজ্ঞপ্তি',
    notificationPreferences: 'বিজ্ঞপ্তি পছন্দসমূহ',
    contactUs: 'যোগাযোগ করুন',
    logout: 'লগআউট',
    editProfile: 'প্রোফাইল সম্পাদনা',
    name: 'নাম',
    email: 'ইমেইল',
    phone: 'ফোন',
    verifyPhoneNumber: 'ফোন নম্বর যাচাই করুন',
    verifyEmailChange: 'ইমেইল পরিবর্তন যাচাই করুন',
    enterOTP: 'ওটিপি লিখুন',
    verifyOTP: 'ওটিপি যাচাই করুন',
    cancel: 'বাতিল',
    saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
    emailContact: 'ইমেইল: support@durjogprohori.com',
    addressContact: 'ঠিকানা: ঢাকা, বাংলাদেশ',

    // Weather Dashboard
    temperature: 'তাপমাত্রা',
    realFeel: 'অনুভূত তাপমাত্রা',
    todaysForecast: 'আজকের আবহাওয়া',
    tenDayForecast: '১০ দিনের আবহাওয়া',
    humidity: 'আর্দ্রতা',
    uvIndex: 'ইউভি সূচক',
    airQuality: 'বায়ুর মান',
    windSpeed: 'বাতাসের গতি',
    windDirection: 'বাতাসের দিক',
    visibility: 'দৃশ্যমানতা',
    loadingWeather: 'আবহাওয়ার তথ্য লোড হচ্ছে...',
    locale: 'bn-BD',
    showMore: 'আরো দেখুন',
    showLess: 'কম দেখুন',
    currentConditions: 'বর্তমান অবস্থা',
    dewPoint: 'শিশির বিন্দু',
    clear: 'পরিষ্কার দৃশ্যমানতা',
    good: 'ভালো দৃশ্যমানতা',
    limited: 'সীমিত দৃশ্যমানতা',
    light: 'হালকা',
    moderate: 'মধ্যম',
    strong: 'শক্তিশালী',
    from: 'থেকে',
    uvLow: 'কম',
    uvModerate: 'মাঝারি',
    uvHigh: 'বেশি',
    uvVeryHigh: 'অতি বেশি',
    uvExtreme: 'চরম',
    sunriseSunset: 'সূর্যোদয় ও সূর্যাস্ত',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    dawn: 'ভোর',
    dusk: 'সন্ধ্যা',
    pressure: 'চাপ',
    pressureLow: 'কম',
    pressureNormal: 'স্বাভাবিক',
    pressureHigh: 'বেশি',
    lastUpdated: 'সর্বশেষ আপডেট',
    refresh: 'রিফ্রেশ',
    now: 'এখন',
    feelsLike: 'অনুভূত হচ্ছে',
    high: 'সর্বোচ্চ',
    low: 'সর্বনিম্ন',
    lightRain: 'হালকা বৃষ্টি',

    // Alerts
    weatherAlert: 'আবহাওয়া সতর্কতা',
    emergencyAlert: 'জরুরি সতর্কতা',
    heavyRainfallAlert: 'আপনার এলাকায় ভারী বৃষ্টিপাতের সম্ভাবনা',
    flashFloodAlert: 'আশেপাশের এলাকায় হঠাৎ বন্যার সতর্কতা',
    hoursAgo: (hours) => `${hours} ঘন্টা আগে`,
    noNotifications: 'এই মুহূর্তে কোন বিজ্ঞপ্তি নেই',
    markAsRead: 'পঠিত হিসেবে চিহ্নিত করুন',
    markAllAsRead: 'সব পঠিত হিসেবে চিহ্নিত করুন',

    // Map
    mapImplementation: 'মানচিত্র ভিউ এখানে বাস্তবায়িত হবে',

    // Disaster Types
    disasterMonitor: 'দুর্যোগ পর্যবেক্ষক',
    earthquake: 'ভূমিকম্প',
    earthquakeDesc: 'ভূমিকম্প এবং সতর্কতা পর্যবেক্ষণ করুন',
    flood: 'বন্যা',
    floodDesc: 'বন্যার সতর্কতা এবং জলস্তর পর্যবেক্ষণ করুন',
    cyclone: 'ঘূর্ণিঝড়',
    cycloneDesc: 'ঘূর্ণিঝড় গঠন এবং সতর্কতা পর্যবেক্ষণ করুন',
    landslide: 'ভূমিধস',
    landslideDesc: 'ভূমিধসের ঝুঁকি এবং সতর্কতা পর্যবেক্ষণ করুন',
    tsunami: 'সুনামি',
    tsunamiDesc: 'সুনামি সতর্কতা পর্যবেক্ষণ করুন',
    fire: 'অগ্নিকাণ্ড',
    fireDesc: 'অগ্নিকাণ্ড এবং সতর্কতা পর্যবেক্ষণ করুন',
    other: 'অন্যান্য',
    otherDesc: 'অন্যান্য দুর্যোগের সতর্কতা দেখুন',

    // SOS
    emergencySOS: 'জরুরি এসওএস',
    nationalEmergency: 'জাতীয় জরুরি সেবা',
    nationalEmergencyDesc: 'যেকোনো জরুরি পরিস্থিতির জন্য',
    ambulanceService: 'অ্যাম্বুলেন্স সেবা',
    ambulanceServiceDesc: '২৪/৭ জরুরি চিকিৎসা সহায়তা',
    fireService: 'ফায়ার সার্ভিস',
    fireServiceDesc: 'অগ্নিকাণ্ড জরুরি এবং উদ্ধার সেবা',
    policeHelpline: 'পুলিশ হেল্পলাইন',
    policeHelplineDesc: 'পুলিশ জরুরি সহায়তা',
    shareLocation: 'অবস্থান শেয়ার করুন',
    gettingLocation: 'অবস্থান নির্ণয় করা হচ্ছে...',
    currentLocation: 'আপনার বর্তমান অবস্থান',
    latitude: 'অক্ষাংশ',
    longitude: 'দ্রাঘিমাংশ',
    accuracy: 'নির্ভুলতা',
    meters: 'মিটার',
    locationError: 'অবস্থান সংক্রান্ত ত্রুটি',
    geolocationNotSupported: 'আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না',
    locationPermissionDenied: 'অনুগ্রহ করে অবস্থান অ্যাক্সেস অনুমতি দিন।',
    locationUnavailable: 'অবস্থান তথ্য পাওয়া যাচ্ছে না।',
    locationTimeout: 'অবস্থান অনুরোধের সময় শেষ হয়ে গেছে।',
    unknownError: 'একটি অজানা ত্রুটি ঘটেছে।',
    importantNotes: 'গুরুত্বপূর্ণ নোট',
    stayCalm: 'জরুরি সেবায় কল করার সময় শান্ত থাকুন এবং স্পষ্টভাবে কথা বলুন',
    followInstructions: 'জরুরি কর্মীদের নির্দেশনা অনুসরণ করুন',
    keepPhoneFree: 'জরুরি কল করার পর আপনার ফোন লাইন খালি রাখুন',
    sendSOSAlert: 'এসওএস অ্যালার্ট পাঠান',
    sendingSOSAlert: 'অ্যালার্ট পাঠানো হচ্ছে...',
    sosSubmissionSuccess: 'এসওএস অ্যালার্ট সফলভাবে পাঠানো হয়েছে! সাহায্য আসছে।',
    sosSubmissionFailed: 'এসওএস অ্যালার্ট পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    fullName: 'পুরো নাম',
    enterYourName: 'আপনার পুরো নাম লিখুন',
    phoneNumber: 'ফোন নম্বর',
    enterYourPhone: 'আপনার ফোন নম্বর লিখুন',
    locationRequired: 'এসওএস অ্যালার্ট পাঠাতে অবস্থান প্রয়োজন।',
    nameRequired: 'এসওএস অ্যালার্ট পাঠাতে নাম প্রয়োজন।',
    phoneRequired: 'এসওএস অ্যালার্ট পাঠাতে ফোন নম্বর প্রয়োজন।',
    loginRequired: 'এসওএস অ্যালার্ট পাঠাতে আপনাকে লগইন করতে হবে।',

    // Email Verification
    verifyEmail: 'আপনার ইমেইল যাচাই করুন',
    verificationCode: 'যাচাইকরণ কোড',
    enterVerificationCode: 'যাচাইকরণ কোড লিখুন',
    verificationCodeSent: "আমরা {email} এ একটি যাচাইকরণ কোড পাঠিয়েছি",
    verificationFailed: 'যাচাইকরণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    verificationCodeResent: 'যাচাইকরণ কোড আপনার ইমেইলে আবার পাঠানো হয়েছে।',
    resendCodeFailed: 'কোড পুনরায় পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    resendCode: 'কোড পুনরায় পাঠান',
    verifying: 'যাচাই করা হচ্ছে...'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key, params) => {
    const translation = translations[language][key];
    if (typeof translation === 'function') {
      return translation(params);
    }
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 