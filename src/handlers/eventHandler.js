const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

function loadEvents(client) {
  const eventPath = path.join(__dirname, '../events');
  if (!fs.existsSync(eventPath)) return;
  const eventFiles = fs.readdirSync(eventPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    logger(`Evénement chargé : ${event.name}`);
  }
}

module.exports = { loadEvents };
