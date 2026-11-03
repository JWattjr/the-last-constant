import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DuelScreen from './duel/DuelScreen';

// The equation duel is the game; ?classic keeps the original First Trial (and only its stylesheet) as a fallback.
const classic = new URLSearchParams(location.search).has('classic');
if (classic) void import('./styles.css');
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{classic ? <App /> : <DuelScreen />}</React.StrictMode>);
