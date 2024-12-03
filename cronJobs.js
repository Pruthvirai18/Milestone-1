const cron = require('node-cron');
const WebSocket = require('ws');
const habits = require('../data/habits');


function startWebSocketServer() {
  const wss = new WebSocket.Server({ port: 8081 });

  
  cron.schedule('0 9 * * *', () => {
    const today = new Date().toISOString().split('T')[0];
    const reminders = habits
      .filter((habit) => !habit.completion.includes(today))
      .map((habit) => `Reminder: Complete your habit "${habit.name}"`);

    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        reminders.forEach((reminder) => client.send(reminder));
      }
    });
  });

  console.log('WebSocket Server running on ws://localhost:8080');
}

module.exports = startWebSocketServer;
