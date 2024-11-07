import clientPromise from '../../src/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('my_personal_website');

  if (req.method === 'POST') {
    const { activityName, activityDuration, weeks, daysOfWeek, priority } = req.body;

    if (!activityName || !activityDuration || !weeks || !daysOfWeek || !priority) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Calculate the number of days and initialize arrays
    const daysCount = weeks * daysOfWeek.length;
    const totalTimeSpent = Array(daysCount).fill('00:00:00'); // Track time for each day
    const isCompleted = Array(daysCount).fill(false); // Track completion for each day
    const isRunning = Array(daysCount).fill(false); // Track running status for each day

    try {
      const result = await db.collection('activity').insertOne({
        activityName,
        activityDuration, // Duration in hh:mm:ss
        weeks, // Number of weeks
        daysOfWeek, // Array of days
        priority, // Priority: High, Medium, Low
        totalTimeSpent,
        isCompleted,
        isRunning,
        createdAt: new Date(), // Task creation date
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
