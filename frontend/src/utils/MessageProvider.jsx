import React, { createContext, useState } from 'react';
import Alert from '../components/Alert';

export const MessageContext = createContext();

function MessageProvider({ children }) {
    const [message, setMessage] = useState(null);
    const [type, setType] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    const showMessage = (msg, msgType) => {
        setMessage(msg);
        setType(msgType);
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false);
            setTimeout(() => {
                setMessage(null);
                setType(null);
            }, 500);
        }, 7500);
    };

    const showSuccessMessage = (msg) => showMessage(msg, 'success');
    const showErrorMessage = (msg) => showMessage(msg, 'error');
    const showWarningMessage = (msg) => showMessage(msg, 'warning');

    return (
        <MessageContext.Provider
            value={{ showSuccessMessage, showErrorMessage, showWarningMessage }}
        >
            {showAlert && <Alert message={message} type={type} onClick={() => setShowAlert(false)}/>}
            {children}
        </MessageContext.Provider>
    );
}

export default MessageProvider;
