
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex items-center">
        <svg className="h-7 w-7 md:h-8 md:w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L4 9V21H20V9L12 3Z" />
        </svg>
        <span className="ml-2 text-lg md:text-xl font-bold text-primary truncate">
          <span className="hidden sm:inline">ANY GAS Myanmar</span>
          <span className="sm:hidden">ANY GAS</span>
        </span>
      </div>
    </Link>
  );
};

export default Logo;
