import React from 'react'

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex">
      <button
        type="button"
        className={`flex-1 py-4 text-center text-sm font-medium transition-colors duration-200 cursor-pointer ${
          activeTab === 'login'
            ? 'text-gray-900 bg-white'
            : 'text-gray-400 bg-gray-100 hover:text-[#b7853f]'
        }`}
        onClick={() => onTabChange('login')}
      >
        LOGIN
      </button>
      <button
        type="button"
        className={`flex-1 py-4 text-center text-sm font-medium transition-colors duration-200 cursor-pointer ${
          activeTab === 'signup'
            ? 'text-gray-900 bg-white'
            : 'text-gray-400 bg-gray-100 hover:text-[#b7853f]'
        }`}
        onClick={() => onTabChange('signup')}
      >
        SIGNUP
      </button>
    </div>
  )
}

export default AuthTabs
