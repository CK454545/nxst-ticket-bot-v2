const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { EMOJIS } = require('../../utils/constantes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ouvrir')
    .setDescription('Ouvre un nouveau ticket de support')
    .addStringOption(option =>
      option.setName('sujet')
        .setDescription('Sujet de la demande')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('priorite-select')
      .setPlaceholder('Sélectionnez la priorité')
      .addOptions([
        { label: 'Urgent', value: 'urgent', emoji: EMOJIS.urgent },
        { label: 'Normal', value: 'normal', emoji: EMOJIS.normal },
        { label: 'Faible', value: 'faible', emoji: EMOJIS.faible }
      ]);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ content: 'Merci de choisir la priorité de votre demande :', components: [row], ephemeral: true });
  }
};
