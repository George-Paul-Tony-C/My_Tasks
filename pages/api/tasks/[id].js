import clientPromise from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to parse time strings to seconds
const timeStringToSeconds = (timeString) =>
  timeString.split(':').reduce((acc, time) => 60 * acc + +time, 0);

// Helper function to format seconds to time string
const secondsToTimeString = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Helper function to add elapsed time and check if the task for the day should be completed
function addElapsedTime(dayTimeSpent, elapsedTimeInSeconds, activityDuration) {
  const total = timeStringToSeconds(dayTimeSpent);
  const updatedTotal = total + elapsedTimeInSeconds;
  const totalDurationInSeconds = timeStringToSeconds(activityDuration);

  const isCompleted = updatedTotal >= totalDurationInSeconds;
  const timeSpent = secondsToTimeString(updatedTotal);

  return { timeSpent, isCompleted };
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('my_personal_website');
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  if (req.method === 'GET') {
    try {
      const task = await db.collection('activity').findOne({ _id: new ObjectId(id) });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json({ task });
    } catch (error) {
      console.error('Failed to fetch task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    const { action, dayIndex, priority } = req.body;

    try {
      const task = await db.collection('activity').findOne({ _id: new ObjectId(id) });
      if (!task || dayIndex === undefined)
        return res.status(404).json({ error: 'Invalid task or day index' });

      if (action === 'updatePriority') {
        await db
          .collection('activity')
          .updateOne({ _id: new ObjectId(id) }, { $set: { priority } });
        res.status(200).json({ message: 'Task priority updated', priority });
      } else if (action === 'complete') {
        task.isCompleted[dayIndex] = true;
        await db
          .collection('activity')
          .updateOne({ _id: new ObjectId(id) }, { $set: { isCompleted: task.isCompleted } });
        res
          .status(200)
          .json({ message: 'Task marked as completed for the specified day', dayIndex });
      } else if (action === 'start') {
        task.isRunning[dayIndex] = true;
        await db
          .collection('activity')
          .updateOne(
            { _id: new ObjectId(id) },
            { $set: { isRunning: task.isRunning, startTime: new Date() } }
          );
        res.status(200).json({ message: 'Task started for specified day' });
      } else if (action === 'pause') {
        const now = new Date().getTime();
        const startTime = new Date(task.startTime).getTime();
        const elapsedTime = Math.floor((now - startTime) / 1000); // Elapsed time in seconds

        const { timeSpent, isCompleted } = addElapsedTime(
          task.totalTimeSpent[dayIndex],
          elapsedTime,
          task.activityDuration
        );

        task.totalTimeSpent[dayIndex] = timeSpent;
        task.isCompleted[dayIndex] = isCompleted;
        task.isRunning[dayIndex] = false;

        await db.collection('activity').updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              isRunning: task.isRunning,
              totalTimeSpent: task.totalTimeSpent,
              isCompleted: task.isCompleted,
            },
          }
        );
        res
          .status(200)
          .json({ message: 'Task paused for specified day', totalTimeSpent: timeSpent, isCompleted });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await db.collection('activity').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
