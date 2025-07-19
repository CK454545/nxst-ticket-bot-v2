const { EmbedBuilder } = require('discord.js');

const ACTION_COLORS = {
  'Ouverture': '#43A047',  // vert
  'Claim': '#1E88E5',      // bleu
  'Fermeture': '#E53935',  // rouge
  'Erreur': '#FF0000',     // rouge vif
  'Info': '#7289DA',       // bleu clair
};

/**
 * Log stylisé dans un salon Discord
 */
async function logTicketAction(guild, channelId, action, user, ticketChannel, details = '') {
  try {
    const logChannel = guild.channels.cache.get(channelId);
    if (!logChannel) {
      console.warn(`Salon de logs introuvable : ${channelId}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📄 Log Ticket — ${action}`)
      .setColor(ACTION_COLORS[action] || ACTION_COLORS['Info'])
      .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 128 }))
      .addFields(
        { name: '👤 Utilisateur', value: `<@${user.id}> (${user.tag})`, inline: true },
        { name: '📁 Ticket', value: `<#${ticketChannel.id}>`, inline: true },
        { name: '🕒 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
      );

    if (details && details.length > 0) {
      embed.addFields({ name: 'ℹ️ Détails', value: details, inline: false });
    }

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du log ticket :', error);
  }
}

/**
 * Logger console simple
 */
function logger(message) {
  console.log(`[${new Date().toISOString()}] [INFO] ${message}`);
}

module.exports = { logTicketAction, logger };
