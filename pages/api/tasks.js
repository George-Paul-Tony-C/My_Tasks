// pages/api/tasks.js
import clientPromise from '../../src/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to add elapsed time and check if the task should be marked as completed
function addElapsedTime(totalTimeSpent, elapsedTimeInSeconds, activityDuration) {
  const total = totalTimeSpent.split(':').reduce((acc, time) => (60 * acc) + +time); // Convert hh:mm:ss to total seconds
  const updatedTotal = total + elapsedTimeInSeconds; // Add the new elapsed time
  const totalDurationInSeconds = activityDuration.split(':').reduce((acc, time) => (60 * acc) + +time); // Convert duration to total seconds

  const isCompleted = updatedTotal >= totalDurationInSeconds;
  const h = Math.floor(updatedTotal / 3600);
  const m = Math.floor((updatedTotal % 3600) / 60);
  const s = updatedTotal % 60;

  return {
    timeSpent: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    isCompleted
  };
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('my_personal_website');

  if (req.method === 'GET') {
    // Fetch all tasks and sort by priority (high, medium, low)
    try {
      const tasks = await db.collection('activity').find({}).toArray();
      
      // Sort tasks based on priority
      const sortedTasks = tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      res.status(200).json({ tasks: sortedTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { taskId, action, priority } = req.body;

    try {
      const task = await db.collection('activity').findOne({ _id: new ObjectId(taskId) });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Handle 'updatePriority' action
      if (action === 'updatePriority') {
        await db.collection('activity').updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { priority } }
        );
        res.status(200).json({ message: 'Task priority updated', priority });
      }

      // Handle 'complete' action
      else if (action === 'complete') {
        await db.collection('activity').updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { isRunning: false, isCompleted: true } }
        );
        res.status(200).json({ message: 'Task marked as completed' });
      }

      // Handle 'start' action
      else if (action === 'start') {
        await db.collection('activity').updateOne(
          { _id: new ObjectId(taskId) },
          {
            $set: { isRunning: true, startTime: new Date() }
          }
        );
        res.status(200).json({ message: 'Task started' });
      }

      // Handle 'pause' action
      else if (action === 'pause') {
        const now = new Date().getTime();
        const startTime = new Date(task.startTime).getTime();
        const elapsedTime = Math.floor((now - startTime) / 1000); // Elapsed time in seconds

        const { timeSpent, isCompleted } = addElapsedTime(task.totalTimeSpent, elapsedTime, task.activityDuration);

        // Update the task, marking it as complete if it exceeds the duration
        await db.collection('activity').updateOne(
          { _id: new ObjectId(taskId) },
          {
            $set: {
              isRunning: false,
              totalTimeSpent: timeSpent,
              startTime: null,
              isCompleted: isCompleted
            }
          }
        );
        res.status(200).json({ message: 'Task paused', totalTimeSpent: timeSpent, isCompleted });
      }

      // Invalid action handling
      else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } 
  // Handle DELETE request to delete a task
  else if (req.method === 'DELETE') {
    const { taskId } = req.body;

    try {
      const result = await db.collection('activity').deleteOne({ _id: new ObjectId(taskId) });
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
