// app/page.tsx
import React from 'react';
import HeaderServer from './_components/HeaderServer';
import ClientPage from './_components/ClientPage';

// This is a server component
export default async function Page() {
  const userData = await HeaderServer();
  
  // Render the ClientPage with the user data
  return <ClientPage userData={userData} />;
}
