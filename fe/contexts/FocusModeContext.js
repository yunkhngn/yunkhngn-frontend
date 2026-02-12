import React, { createContext, useContext, useState } from 'react';

const FocusModeContext = createContext();

export function useFocusMode() {
    return useContext(FocusModeContext);
}

export function FocusModeProvider({ children }) {
    const [isFocusMode, setIsFocusMode] = useState(false);

    const toggleFocusMode = () => {
        setIsFocusMode((prev) => !prev);
    };

    const value = {
        isFocusMode,
        toggleFocusMode,
        setIsFocusMode,
    };

    return (
        <FocusModeContext.Provider value={value}>
            {children}
        </FocusModeContext.Provider>
    );
}
