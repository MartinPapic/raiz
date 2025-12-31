"use client";

import HomeView from './views/HomeView';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Page() {
  const { user } = useUser();

  return (
    <div>


      <HomeView />
    </div>
  );
}
