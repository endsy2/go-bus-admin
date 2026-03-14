import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLocale } from '../../../context/LocaleContext';
import Icon from '../../atoms/Icon/Icon';
import './TopBar.css';

const USFlag = () => (
  <svg
    width="24"
    height="18"
    viewBox="0 0 28 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="20" rx="2" fill="white" />

    <path
      fill="#D02F44"
      d="M28 0H0V1.33H28V0ZM28 2.66H0V4H28V2.66ZM0 5.33H28V6.66H0V5.33ZM28 8H0V9.33H28V8ZM0 10.66H28V12H0V10.66ZM28 13.33H0V14.66H28V13.33ZM0 16H28V17.33H0V16ZM28 18.66H0V20H28V18.66Z"
    />

    <rect width="12" height="9.33" fill="#46467F" />

    <circle cx="2" cy="2" r="0.5" fill="white" />
    <circle cx="4" cy="2" r="0.5" fill="white" />
    <circle cx="6" cy="2" r="0.5" fill="white" />
    <circle cx="8" cy="2" r="0.5" fill="white" />
    <circle cx="10" cy="2" r="0.5" fill="white" />

    <circle cx="3" cy="4" r="0.5" fill="white" />
    <circle cx="5" cy="4" r="0.5" fill="white" />
    <circle cx="7" cy="4" r="0.5" fill="white" />
    <circle cx="9" cy="4" r="0.5" fill="white" />

    <circle cx="2" cy="6" r="0.5" fill="white" />
    <circle cx="4" cy="6" r="0.5" fill="white" />
    <circle cx="6" cy="6" r="0.5" fill="white" />
    <circle cx="8" cy="6" r="0.5" fill="white" />
    <circle cx="10" cy="6" r="0.5" fill="white" />
  </svg>
);

const KhmerFlag = () => (
  <svg
    width="24"
    height="18"
    viewBox="0 0 28 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="20" rx="2" fill="#032EA1" />
    <rect y="5.5" width="28" height="9" fill="#E01E24" />
    <g transform="translate(8, 6) scale(0.35)">
      <path fill="#FFF" d="M27.021 22.897v-.902h-.542v-.901h-.496v-.586h-.226v-.451h-.438l-.238-.341v-1.599l.271-.271v-1.488l-.226.203v-.474h-.181v.226h-.359v-.723l-.429.384l.136-.485l-.249-1.116h-.136s-.111-.474-.337-.474c0 0 .09-.292-.091-.292s-.136.225-.136.225s-.315.136-.315.473l-.18-.022l-.271 1.307l.191.384l-.44-.384v.993H19.94v-.902l-.136.135v.316h-.315v-.316l.226-.203v-.428l-.182.191l-.271-.372v-.316l-.157.157l-.046-.27l.226-.36l-.034-.293l-.258.315v-.27l.113-.248l-.519-1.309l-.124-.362l-.191-.022v-.181s-.136-.315-.316-.315s-.315.315-.315.315v.181l-.191.022l-.125.362l-.518 1.309l.113.248v.27l-.259-.315l-.035.293l.226.36l-.044.27l-.158-.157v.316l-.27.372l-.181-.191v.428l.226.203v.316h-.315v-.316l-.136-.135v.902H13.58v-.993l-.44.384l.191-.384l-.271-1.307l-.181.022c0-.337-.315-.473-.315-.473s.045-.225-.136-.225c-.18 0-.09.292-.09.292c-.226 0-.338.474-.338.474h-.135l-.248 1.116l.135.485l-.428-.384v.722h-.361v-.226h-.181v.474l-.225-.203v1.488l.27.271v1.599l-.239.341h-.348v.451h-.314v.586h-.452v.901h-.495v.902h-.497l-.045.991h19.035l.045-.991h-.496z" />
    </g>
  </svg>
);

const TopBar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: <USFlag /> },
    { code: 'km', name: 'ខ្មែរ', flag: <KhmerFlag /> }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (code) => {
    setLocale(code);
    setIsLangDropdownOpen(false);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
      
      <div className="top-bar-right">
        {/* Language Dropdown */}
        <div className="language-dropdown" ref={dropdownRef}>
          <button 
            className="lang-select-btn"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          >
            <div className="lang-flag">{currentLanguage?.flag}</div>
            <span className="lang-name">{currentLanguage?.name}</span>
            <Icon name="chevronDown" size={14} className={`lang-arrow ${isLangDropdownOpen ? 'open' : ''}`} />
          </button>
          
          {isLangDropdownOpen && (
            <div className="lang-dropdown-menu">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option ${locale === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <div className="lang-flag">{lang.flag}</div>
                  <span>{lang.name}</span>
                  {locale === lang.code && (
                    <Icon name="check" size={16} className="check-icon" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Switch */}
        <div className="theme-toggle">
          <Icon name="sun" size={16} />
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isDark} 
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
          <Icon name="moon" size={16} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
