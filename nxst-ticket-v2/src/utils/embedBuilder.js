const { EmbedBuilder } = require('discord.js');
const { COULEURS, EMOJIS } = require('./constantes');

function buildTicketEmbed({ titre, description, priorite, utilisateur, staff, status, timestamp, image, thumbnail }) {
  const couleur = priorite === 'urgent' ? COULEURS.urgent :
                  priorite === 'normal' ? COULEURS.normal :
                  priorite === 'faible' ? COULEURS.faible : COULEURS.principal;

  const embed = new EmbedBuilder()
    .setColor(couleur)
    .setTitle(`${EMOJIS.info} ${titre}`)
    .setDescription(description)
    .addFields(
      { name: 'Priorité', value: `${priorite.charAt(0).toUpperCase() + priorite.slice(1)} ${EMOJIS[priorite] || ''}`, inline: true },
      { name: 'Statut', value: status || 'Ouvert', inline: true },
      { name: 'Auteur', value: utilisateur ? `<@${utilisateur}>` : 'Non défini', inline: true }
    )
    .setTimestamp(timestamp || Date.now());

  if (staff) embed.addFields({ name: 'Staff Assigné', value: `<@${staff}>`, inline: true });
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);

  return embed;
}

module.exports = { buildTicketEmbed };
