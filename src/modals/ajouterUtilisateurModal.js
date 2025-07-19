const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

function buildAjouterUtilisateurModal() {
  return new ModalBuilder()
    .setCustomId('ajouter-utilisateur-modal')
    .setTitle('Ajouter un utilisateur au ticket')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('utilisateur')
          .setLabel('Mentionne ou donne l\'ID du membre')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
}

module.exports = { buildAjouterUtilisateurModal };
