import { Outlet, useOutletContext } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import Sidebar from "@/components/organisms/Sidebar";
import MobileNav from "@/components/organisms/MobileNav";

const Layout = () => {
  // App-level state and methods can be defined here
  // and passed to child routes via outletContext
  const contextValue = {
    // Add any app-level state or methods here
    // Example: user, theme, notifications, etc.
  };
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:block" />
        
        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Main Content */}
        <div className="lg:ml-64 pt-20 lg:pt-0">
          <main className="p-6">
            <Outlet context={contextValue} />
          </main>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
/>
    </>
  );
};

export default Layout;