// pages/api/notifications.js

export default async function handler(req, res) {
    // Simulate fetching notifications from a database
    const notifications = [
      {
        id: 1,
        message: 'Your task "Math Homework" is due today.',
        date: new Date(),
        link: '/task/123', // Link to the task detail page
      },
      {
        id: 2,
        message: 'You have a new message from John.',
        date: new Date(),
        link: '/messages',
      },
      // Add more notifications as needed
    ];
  
    res.status(200).json({ notifications });
  }
  