const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

function loadCommands(client) {
  const cmdPath = path.join(__dirname, '../commands');
  if (!fs.existsSync(cmdPath)) return;
  fs.readdirSync(cmdPath).forEach(dir => {
    const dirPath = path.join(cmdPath, dir);
    if (!fs.lstatSync(dirPath).isDirectory()) return;
    fs.readdirSync(dirPath).forEach(file => {
      if (!file.endsWith('.js')) return;
      const command = require(path.join(dirPath, file));
      client.commands.set(command.data.name, command);
      logger(`Commande chargée : ${command.data.name}`);  // Plus d'erreur ici
    });
  });
}

module.exports = { loadCommands };
