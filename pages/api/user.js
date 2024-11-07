// src/pages/api/user.js

import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // Simulate user data (replace with actual data fetching logic)
  const user = {
    name: 'George Paul Tony .C',
    email: 'cgeorgept18112004@gmail.com',
    profilePicture: '/images/Passport.JPG', // Update with actual profile picture URL
    totalTasks: 20,
    tasksCompleted: 15,
    tasksOngoing: 5,
  };

  if (req.method === 'GET') {
    // Return user data
    res.status(200).json({ user });
  } else if (req.method === 'PUT') {
    // Update user data (you need to implement the actual update logic)
    const updatedUserData = req.body;
    // TODO: Update the user data in your database
    res.status(200).json({ user: { ...user, ...updatedUserData } });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
