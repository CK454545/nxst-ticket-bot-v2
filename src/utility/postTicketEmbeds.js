const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const LOGO = 'https://i.goopics.net/uxgd48.png';
const BANNER = 'https://i.goopics.net/yq8i3d.png';

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  // ----- SUPPORT -----
  const salonSupport = await client.channels.fetch(process.env.SALON_SUPPORT_ID);
  if (salonSupport) {
    await salonSupport.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#a259fe')
          .setTitle('🌴✨ NXST RP | SUPPORT PREMIUM ✨🌴')
          .setThumbnail(LOGO)
          .setImage(BANNER)
          .setDescription([
            "🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣",
            "🦩 **Bienvenue sur le SUPPORT PREMIUM NXST RP**",
            "",
            "Pour toute question, bug, plainte, ou demande RP,\nclique sur le bouton ci-dessous !",
            "",
            "🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢",
            "",
            "💡 **Conseils pour un traitement rapide :**\n• Sois clair et précis\n• Mets ton pseudo RP dans ta demande\n• Ajoute une capture d’écran si besoin",
            "",
            "⏰ **Horaires du support :** 10h – 2h\n🎖️ Staff réactif, réponse rapide",
            "",
            "🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣",
            "",
            "👇 **Ouvre ton ticket ici !**"
          ].join('\n'))
          .setFooter({ text: 'NXST RP • Support officiel', iconURL: LOGO })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ouvrir-support')
            .setLabel('🎫 Ouvrir un ticket SUPPORT')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        )
      ]
    });
    console.log('Embed SUPPORT premium mobile posté !');
  } else {
    console.log('Salon support introuvable.');
  }

  // ----- BOUTIQUE -----
  const salonBoutique = await client.channels.fetch(process.env.SALON_BOUTIQUE_ID);
  if (salonBoutique) {
    await salonBoutique.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#ffe600')
          .setTitle('🛒💎 NXST RP | BOUTIQUE OFFICIELLE 💎🛒')
          .setThumbnail(LOGO)
          .setImage(BANNER)
          .setDescription([
            "🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡",
            "🛒 **Bienvenue sur la BOUTIQUE NXST RP**",
            "",
            "Pour acheter, demander ou signaler un souci,\nclique sur le bouton ci-dessous !",
            "",
            "🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢",
            "",
            "💡 **Conseils pour une commande express :**\n• Indique le produit ou pack désiré\n• Précise ton pseudo RP\n• Un problème ? Explique-le clairement",
            "",
            "💸 Paiement sécurisé – Livraison rapide",
            "",
            "🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡",
            "",
            "👇 **Ouvre ton ticket ici !**"
          ].join('\n'))
          .setFooter({ text: 'NXST RP • Boutique officielle', iconURL: LOGO })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ouvrir-boutique')
            .setLabel('🛒 Ouvrir un ticket BOUTIQUE')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🛒')
        )
      ]
    });
    console.log('Embed BOUTIQUE premium mobile posté !');
  } else {
    console.log('Salon boutique introuvable.');
  }

  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
