import React from 'react';
import { Link } from 'react-router-dom';
import { FaWater, FaFire, FaMountain } from 'react-icons/fa';
import { GiEarthCrack, GiTornado, GiWaterSplash } from 'react-icons/gi';

const DisastersMenu = () => {
  const disasters = [
    {
      id: 'earthquake',
      title: 'Earthquake',
      icon: <GiEarthCrack className="text-4xl" />,
      color: 'bg-red-500',
    },
    {
      id: 'flood',
      title: 'Flood',
      icon: <FaWater className="text-4xl" />,
      color: 'bg-blue-500',
    },
    {
      id: 'landslide',
      title: 'Landslide',
      icon: <FaMountain className="text-4xl" />,
      color: 'bg-yellow-600',
    },
    {
      id: 'fire',
      title: 'Fire',
      icon: <FaFire className="text-4xl" />,
      color: 'bg-orange-500',
    },
    {
      id: 'tsunami',
      title: 'Tsunami',
      icon: <GiWaterSplash className="text-4xl" />,
      color: 'bg-blue-600',
    },
    {
      id: 'cyclone',
      title: 'Cyclone',
      icon: <GiTornado className="text-4xl" />,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Disaster Information
        </h1>
        
        <div className="grid grid-cols-2 gap-4">
          {disasters.map((disaster) => (
            <Link
              key={disaster.id}
              to={`/disasters/${disaster.id}`}
              className={`${disaster.color} text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center transform transition-transform hover:scale-105`}
            >
              <div className="mb-3">{disaster.icon}</div>
              <h2 className="text-lg font-semibold">{disaster.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisastersMenu; 