'use client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        toastClassName="toast-item"
      />
    </>
  );
}

export { toast };