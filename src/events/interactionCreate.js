const { handleInteraction } = require('../handlers/ticketHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Gestion des commandes slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        await interaction.reply({ content: '❌ Une erreur est survenue lors de l’exécution de la commande.', ephemeral: true });
        console.error(error);
      }
    }
    // Gestion des menus/modals tickets
    await handleInteraction(interaction, client);
  }
};
