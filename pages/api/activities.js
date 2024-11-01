import clientPromise from '../../src/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('my_personal_website');

  if (req.method === 'POST') {
    const { activityName, activityDuration, weeks, daysOfWeek, priority } = req.body;

    if (!activityName || !activityDuration || !weeks || !daysOfWeek || !priority) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const result = await db.collection('activity').insertOne({
        activityName,
        activityDuration, // Storing duration in hh:mm:ss format
        weeks, // Number of weeks
        daysOfWeek, // Array of selected days (e.g., ['Monday', 'Wednesday', 'Friday'])
        priority, // Priority field: High, Medium, Low
        totalTimeSpent: '00:00:00', // Initially zero in hh:mm:ss format
        lastLog: null, // Last log initially null
        createdAt: new Date(), // Adding task creation date
        isCompleted: false, // Default value for task completion status
      });

      res.status(201).json({ message: 'Activity created successfully', activityId: result.insertedId });
    } catch (error) {
      console.error("Database insertion error:", error);
      res.status(500).json({ error: 'Failed to create activity' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
