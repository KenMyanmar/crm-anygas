
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex items-center">
        <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L4 9V21H20V9L12 3Z" />
        </svg>
        <span className="ml-2 text-xl font-bold text-primary">ANY GAS Myanmar</span>
      </div>
    </Link>
  );
};

export default Logo;
