import React from 'react';
import exitIcon from '../assets/exit-icon.svg';
import errorIcon from '../assets/error-icon.svg';
import warningIcon from '../assets/warning-icon.svg';
import successIcon from '../assets/success-icon.svg';
import hintIcon from '../assets/hint-icon.svg';

const Alert = ({ message, type = 'success', onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'hint':
        return hintIcon;
      case 'error':
        return errorIcon;
      case 'warning':
        return warningIcon;
      case 'success':
      default:
        return successIcon;
    }
  };

  return (
    <div className={`alert-wrapper ${type}`}>
      <img src={getIcon(type)} alt={`${type} icon`} className="icon" width={32} height={32} />
      <p>{message}</p>
      <img
        src={exitIcon}
        alt="Close"
        className="alert-exit"
        onClick={onClick}
      />
    </div>
  );
};

export default Alert;
