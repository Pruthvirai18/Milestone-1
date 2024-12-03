const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const habits = require('../data/habits');
const cron = require('node-cron'); 

const habitsFilePath = path.join(__dirname, '../data/habits.json');


router.post('/habits', (req, res) => {
  const { name, dailyGoal } = req.body;
  if (!name || !dailyGoal) {
    return res.status(400).json({ status: 'error', error: 'Name and daily goal are required.' });
  }
  const newHabit = {
    id: habits.length + 1,
    name,
    dailyGoal,
    completion: [], 
  };
  habits.push(newHabit);
  res.json({ status: 'success', data: newHabit });
});


router.put('/habits/:id', (req, res) => {
  const { id } = req.params;
  const habit = habits.find((h) => h.id === parseInt(id));
  if (!habit) {
    return res.status(404).json({ status: 'error', error: 'Habit not found.' });
  }
  const today = new Date().toISOString().split('T')[0];
  if (!habit.completion.includes(today)) {
    habit.completion.push(today);
  }
  res.json({ status: 'success', data: habit });
});


router.get('/habits', (req, res) => {
  res.json({ status: 'success', data: habits });
});


router.get('/habits/report', (req, res) => {
  const report = habits.map((habit) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    const completionData = last7Days.map((date) => ({
      date,
      completed: habit.completion.includes(date),
    }));
    return { name: habit.name, completionData };
  });

 
  try {
    fs.writeFileSync(habitsFilePath, JSON.stringify(report, null, 2));
    console.log('Weekly report logged to habits.json');
  } catch (error) {
    console.error('Error writing to habits.json:', error);
  }

  res.json({ status: 'success', data: report });
});


cron.schedule('0 9 * * *', () => {
 
  habits.forEach((habit) => {
    const today = new Date().toISOString().split('T')[0];
    habit.dailyGoal.forEach((goal) => {
      
      if (!habit.completion.includes(`${today}:${goal}`)) {
        console.log(`Reminder: You need to complete your goal: "${goal}" for the habit "${habit.name}" today.`);
        
      }
    });
  });
});

module.exports = router;
