import React from 'react';
import ReactDOM from 'react-dom/client';
console.log('index.tsx executing - App Initializing');
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { ModalProvider } from './contexts/ModalContext';
import { CartProvider } from './contexts/CartContext';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ModalProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ModalProvider>
  </React.StrictMode>
);
