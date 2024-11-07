// api/tasks/[id].js

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
    body,
  } = req;

  const client = await clientPromise;
  const db = client.db('your-database-name'); // Replace with your actual database name
  const collection = db.collection('activity'); // Replace with your actual collection name

  if (method === 'GET') {
    try {
      const task = await collection.findOne({ _id: new ObjectId(id) });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(200).json({ task });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (method === 'PUT') {
    try {
      const { action, dayIndex } = body;

      if (!action || dayIndex === undefined) {
        return res.status(400).json({ error: 'Action and dayIndex are required' });
      }

      const task = await collection.findOne({ _id: new ObjectId(id) });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      switch (action) {
        case 'start':
          task.isRunning[dayIndex] = true;
          task.startTime = new Date();
          break;

        case 'pause':
          if (!task.startTime) {
            return res.status(400).json({ error: 'Task is not running' });
          }
          task.isRunning[dayIndex] = false;
          const elapsedSecondsPause = Math.floor(
            (new Date() - new Date(task.startTime)) / 1000
          );
          task.totalTimeSpent[dayIndex] = addElapsedTime(
            task.totalTimeSpent[dayIndex],
            elapsedSecondsPause
          );
          task.startTime = null;
          break;

        case 'complete':
          if (!task.startTime) {
            return res.status(400).json({ error: 'Task is not running' });
          }
          task.isRunning[dayIndex] = false;
          task.isCompleted[dayIndex] = true;
          const elapsedSecondsComplete = Math.floor(
            (new Date() - new Date(task.startTime)) / 1000
          );
          task.totalTimeSpent[dayIndex] = addElapsedTime(
            task.totalTimeSpent[dayIndex],
            elapsedSecondsComplete
          );
          task.startTime = null;
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: task }
      );

      res.status(200).json({ task });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

// Helper function for the backend
function addElapsedTime(timeSpent = '00:00:00', elapsed = 0) {
  const totalSeconds =
    timeSpent.split(':').reduce((acc, t) => 60 * acc + +t, 0) + elapsed;
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
