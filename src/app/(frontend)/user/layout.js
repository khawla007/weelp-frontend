import React from 'react';

const AuthLayout = ({ children }) => {
  return <div className="min-h-[85vh] flex items-center justify-center bg-muted px-6">{children}</div>;
};

export default AuthLayout;
