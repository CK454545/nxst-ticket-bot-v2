const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} = require('discord.js');

const { logTicketAction, logger } = require('../utils/logger');
const { PRIORITES, EMOJIS, COULEURS } = require('../utils/constantes');
const queue = require('../utils/queue');
const { isTicketOwnerOrStaff } = require('../utils/permissions');
const { buildAjouterUtilisateurModal } = require('../modals/ajouterUtilisateurModal');

const LOGO = "https://i.goopics.net/uxgd48.png";
const BANNER = "https://i.goopics.net/yq8i3d.png";

function getCategory(interaction, type) {
  if (type === "support") return interaction.guild.channels.cache.get(process.env.CATEGORIE_TICKET_SUPPORT_ID);
  if (type === "boutique") return interaction.guild.channels.cache.get(process.env.CATEGORIE_TICKET_BOUTIQUE_ID);
  return null;
}

function getTicketChannelName(priorite, sujet, username) {
  const info = PRIORITES[priorite] || PRIORITES.normal;
  return `${info.nom.replace('ticket-support-', '')}${sujet}-${username.toLowerCase()}`;
}

// Convertit une couleur hex en décimal
function hexToDecimalColor(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return null;
  return parseInt(hex.slice(1), 16);
}

async function handleInteraction(interaction, client) {
  // --- Ouvrir ticket support bouton ---
  if (interaction.isButton() && interaction.customId === 'ouvrir-support' && interaction.channelId === process.env.SALON_SUPPORT_ID) {
    const menuPriorite = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('support-priorite-select')
        .setPlaceholder('Choisis la priorité du ticket')
        .addOptions([
          { label: 'Urgent', value: 'urgent', emoji: PRIORITES.urgent.emoji },
          { label: 'Normal', value: 'normal', emoji: PRIORITES.normal.emoji },
          { label: 'Faible', value: 'faible', emoji: PRIORITES.faible.emoji }
        ])
    );
    await interaction.reply({ content: "**🎫 NXST RP — Support**\n\nSélectionne la priorité de ton ticket :", components: [menuPriorite], flags: 64 });
    setTimeout(async () => {
      try {
        const msg = await interaction.fetchReply();
        await msg.edit({ components: [] });
      } catch {}
    }, 5000);
    return;
  }

  // --- Sélection de la priorité ---
  if (interaction.isStringSelectMenu() && interaction.customId === 'support-priorite-select') {
    const priorite = interaction.values[0];
    const menuSujetSupport = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`support-sujet-select-${priorite}`)
        .setPlaceholder('Choisis la catégorie de ton ticket')
        .addOptions([
          { label: 'Bug', value: 'bug', emoji: EMOJIS.error },
          { label: 'RP (RolePlay)', value: 'rp', emoji: '🎭' },
          { label: 'HRP (Hors RP)', value: 'hrp', emoji: '💬' },
          { label: 'Plainte', value: 'plainte', emoji: '⚠️' },
          { label: 'Recrutement', value: 'recrutement', emoji: '📝' },
          { label: 'Entreprise', value: 'entreprise', emoji: '🏢' },
          { label: 'Gang', value: 'gang', emoji: '🔫' },
          { label: 'Autres', value: 'autres', emoji: '🌐' }
        ])
    );
    await interaction.reply({ content: "**🎫 NXST RP — Support**\n\nSélectionne la catégorie de ton ticket :", components: [menuSujetSupport], flags: 64 });
    setTimeout(async () => {
      try {
        const msg = await interaction.fetchReply();
        await msg.edit({ components: [] });
      } catch {}
    }, 5000);
    return;
  }

  // --- Sélection du sujet ---
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('support-sujet-select-')) {
    const priorite = interaction.customId.split('-').pop();
    const sujet = interaction.values[0];
    const sujetsLabels = {
      bug: 'Bug', rp: 'RP (RolePlay)', hrp: 'HRP (Hors RP)', plainte: 'Plainte',
      recrutement: 'Recrutement', entreprise: 'Entreprise', gang: 'Gang', autres: 'Autres'
    };
    const sujetLabel = sujetsLabels[sujet] || sujet;
    const modalSupport = new ModalBuilder()
      .setCustomId(`modal-support-${sujet}-${priorite}`)
      .setTitle(`Ticket Support - ${sujetLabel}`)
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Explique clairement ta demande')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );
    await interaction.showModal(modalSupport);
    return;
  }

  // --- Soumission modal support ---
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal-support-')) {
    const [, , sujet, priorite] = interaction.customId.split('-');
    const sujetsLabels = {
      bug: 'Bug', rp: 'RP (RolePlay)', hrp: 'HRP (Hors RP)', plainte: 'Plainte',
      recrutement: 'Recrutement', entreprise: 'Entreprise', gang: 'Gang', autres: 'Autres'
    };
    const sujetLabel = sujetsLabels[sujet] || sujet;
    const prioriteInfo = PRIORITES[priorite] ?? PRIORITES.normal ?? {};
    let couleurEmbed = prioriteInfo.couleur;
    if (!couleurEmbed || typeof couleurEmbed !== 'string' || !couleurEmbed.startsWith('#') || couleurEmbed.length !== 7) {
      couleurEmbed = COULEURS.principal;
    }
    const colorDecimal = hexToDecimalColor(couleurEmbed) || hexToDecimalColor(COULEURS.principal);

    const description = interaction.fields.getTextInputValue('description');
    const category = getCategory(interaction, "support");

    const existing = interaction.guild.channels.cache.find(
      c => c.parentId === category?.id &&
           c.name.includes(interaction.user.username.toLowerCase()) &&
           c.type === ChannelType.GuildText &&
           c.permissionsFor(interaction.user.id).has(PermissionFlagsBits.ViewChannel)
    );
    if (existing) {
      await interaction.reply({ content: `❌ Tu as déjà un ticket ouvert ici : <#${existing.id}>\nMerci de le fermer avant d'en ouvrir un autre.`, flags: 64 });
      return;
    }

    const channelName = getTicketChannelName(priorite, sujet, interaction.user.username);
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category?.id ?? null,
      topic: `Ticket support ouvert par ${interaction.user.tag} • Sujet : ${sujetLabel} • Priorité : ${prioriteInfo.label || 'Normal'}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ...process.env.ROLES_STAFF.split(',').map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
      ]
    });

    const embedSupport = new EmbedBuilder()
      .setColor(colorDecimal)
      .setTitle(`${prioriteInfo.emoji || ''} NXST RP | SUPPORT [${prioriteInfo.label || 'Normal'}]`)
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setDescription([
        "═════════════════════════════════════════════",
        "🦩 **Bienvenue sur le** __**SUPPORT ULTRA PREMIUM NXST RP**__\n",
        "```diff\n+ Un staff va te répondre ici dès que possible !\n```",
        "╭─────────────────────────────╮",
        `🎫 **Sujet** : \`${sujetLabel}\``,
        `⭐ **Priorité** : ${prioriteInfo.label || 'Normal'}`,
        "╰─────────────────────────────╯"
      ].join('\n'))
      .addFields(
        { name: '📄 Détail', value: description, inline: false },
        { name: '👤 Joueur', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🕒 Ouvert le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '🟢 Statut', value: '⏳ En attente d’un staff...', inline: true }
      )
      .setFooter({ text: 'NXST RP • Support officiel', iconURL: LOGO })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim-ticket').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('🧑‍💻'),
      new ButtonBuilder().setCustomId('ajouter-utilisateur').setLabel('Ajouter un utilisateur').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
      new ButtonBuilder().setCustomId('close-ticket').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    await channel.send({ embeds: [embedSupport], components: [row] });
    await interaction.reply({ content: `Ticket support créé avec succès : <#${channel.id}>`, flags: 64 });

    queue.resetQueue(channel.id);

    await logTicketAction(
      interaction.guild,
      process.env.LOGS_TICKET_CHANNEL_ID,
      'Ouverture',
      interaction.user,
      channel,
      `Sujet : ${sujetLabel}\nPriorité : ${prioriteInfo.label || 'Normal'}`
    );

    logger(`Ticket support ouvert par ${interaction.user.tag} (${interaction.user.id}) [${sujetLabel}]`);
    return;
  }

  // --- Claim ticket ---
  if (interaction.isButton() && interaction.customId === 'claim-ticket') {
    const staffIDs = process.env.ROLES_STAFF.split(',');
    if (!interaction.member.roles.cache.some(r => staffIDs.includes(r.id))) {
      await interaction.reply({ content: "Vous n'êtes pas autorisé à claim ce ticket.", flags: 64 });
      return;
    }
    await interaction.deferReply({ flags: 64 });

    const msg = await interaction.message.fetch();
    const channel = interaction.channel;
    const q = queue.getQueue(channel.id);

    if (q.length === 0) {
      queue.addToQueue(channel.id, interaction.user.id);

      const oldEmbed = msg.embeds[0];
      let fields = oldEmbed.fields.filter(f => !['🟢 Statut', '👮 Staff Assigné'].includes(f.name));
      fields.push({ name: '🟢 Statut', value: `🎉 Pris en charge par <@${interaction.user.id}>`, inline: true });
      fields.push({ name: '👮 Staff Assigné', value: `<@${interaction.user.id}>`, inline: true });

      const newEmbed = EmbedBuilder.from(oldEmbed)
        .setFields(fields)
        .setFooter({ text: `Claimé par ${interaction.user.tag} — NXST RP`, iconURL: LOGO })
        .setColor(hexToDecimalColor(COULEURS.principal));

      const components = [
        new ActionRowBuilder().addComponents(
          ...msg.components[0].components.map(btn =>
            btn.customId === "claim-ticket"
              ? ButtonBuilder.from(btn).setDisabled(true)
              : btn
          )
        )
      ];

      await msg.edit({ embeds: [newEmbed], components });
      await interaction.editReply({ content: `Ticket claimé par <@${interaction.user.id}> !` });

      await logTicketAction(
        interaction.guild,
        process.env.LOGS_TICKET_CHANNEL_ID,
        'Claim',
        interaction.user,
        channel,
        `Ticket claimé par <@${interaction.user.id}>`
      );

    } else if (!q.includes(interaction.user.id)) {
      queue.addToQueue(channel.id, interaction.user.id);
      await interaction.editReply({ content: `Tu es dans la file d’attente pour ce ticket !\nTu seras notifié si le staff principal passe son tour.` });
    } else {
      await interaction.editReply({ content: `Tu es déjà dans la file d’attente.` });
    }
    return;
  }

  // --- Ajouter utilisateur modal + interaction ---
  if (interaction.isButton() && interaction.customId === 'ajouter-utilisateur') {
    const ticketMsg = (await interaction.channel.messages.fetch({ limit: 10 })).find(m => m.embeds.length > 0);
    const ownerField = ticketMsg?.embeds[0]?.fields.find(f => f.name.includes('Joueur') || f.name.includes('Client'));
    const ticketOwnerId = ownerField ? ownerField.value.match(/\d{17,}/)?.[0] : null;
    const rolesStaff = process.env.ROLES_STAFF.split(',');

    if (!isTicketOwnerOrStaff(interaction.member, ticketOwnerId, rolesStaff)) {
      await interaction.reply({ content: "Seul le staff assigné ou l'auteur du ticket peut ajouter un membre.", flags: 64 });
      return;
    }
    await interaction.showModal(buildAjouterUtilisateurModal());
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ajouter-utilisateur-modal') {
    const userInput = interaction.fields.getTextInputValue('utilisateur');
    let userId = userInput.match(/\d{17,}/)?.[0] || null;
    if (!userId) {
      await interaction.reply({ content: "Utilisateur non reconnu (mention ou ID attendu).", flags: 64 });
      return;
    }
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Utilisateur introuvable sur ce serveur.", flags: 64 });
      return;
    }
    await interaction.channel.permissionOverwrites.edit(userId, {
      ViewChannel: true,
      SendMessages: true
    });
    await interaction.reply({ content: `✅ <@${userId}> a été ajouté au ticket.`, flags: 64 });
    return;
  }

  // --- Partie boutique (similaire support) ---
  if (interaction.isButton() && interaction.customId === 'ouvrir-boutique' && interaction.channelId === process.env.SALON_BOUTIQUE_ID) {
    const menuTypeBoutique = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('boutique-type-select')
        .setPlaceholder('Choisis le type de demande boutique')
        .addOptions([
          { label: 'Achat', value: 'achat', emoji: '🛒' },
          { label: 'Problème boutique', value: 'probleme', emoji: '❗' }
        ])
    );
    await interaction.reply({ content: "**🛒 NXST RP — Boutique**\n\nMerci de sélectionner le type de demande boutique :", components: [menuTypeBoutique], flags: 64 });
    setTimeout(async () => {
      try {
        const msg = await interaction.fetchReply();
        await msg.edit({ components: [] });
      } catch {}
    }, 5000);
    return;
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'boutique-type-select') {
    const type = interaction.values[0];
    if (type === 'achat') {
      const modalAchatBoutique = new ModalBuilder()
        .setCustomId('modal-achat-boutique')
        .setTitle('Achat Boutique NXST RP')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('produit')
              .setLabel('Produit à acheter')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('details')
              .setLabel('Détaille ta demande (Pack/pseudo/infos)')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );
      await interaction.showModal(modalAchatBoutique);
    } else {
      const modalProblemeBoutique = new ModalBuilder()
        .setCustomId('modal-probleme-boutique')
        .setTitle('Problème Boutique NXST RP')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('probleme')
              .setLabel('Décris ton problème')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );
      await interaction.showModal(modalProblemeBoutique);
    }
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal-achat-boutique') {
    const produit = interaction.fields.getTextInputValue('produit');
    const details = interaction.fields.getTextInputValue('details');
    const category = getCategory(interaction, "boutique");
    const existing = interaction.guild.channels.cache.find(
      c => c.parentId === category?.id &&
           c.name.includes(interaction.user.username.toLowerCase()) &&
           c.type === ChannelType.GuildText &&
           c.permissionsFor(interaction.user.id).has(PermissionFlagsBits.ViewChannel)
    );
    if (existing) {
      await interaction.reply({ content: `❌ Tu as déjà un ticket ouvert ici : <#${existing.id}>\nMerci de le fermer avant d'en ouvrir un autre.`, flags: 64 });
      return;
    }

    const channel = await interaction.guild.channels.create({
      name: `🛒-ticket-boutique-${interaction.user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: category?.id ?? null,
      topic: `Ticket boutique ouvert par ${interaction.user.tag} • Achat : ${produit}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ...process.env.ROLES_STAFF.split(',').map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
      ]
    });

    const embedShop = new EmbedBuilder()
      .setColor(hexToDecimalColor(COULEURS.principal))
      .setTitle('🛒💎 NXST RP | Boutique Officielle 💎🛒')
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setDescription([
        "═════════════════════════════════════════════",
        "💸 **Commande boutique enregistrée !**",
        "```diff\n+ Un staff te répond dès que possible ici !\n```",
        "╭─────────────────────────────╮",
        `🛍️ **Produit** : ${produit}`,
        "╰─────────────────────────────╯"
      ].join('\n'))
      .addFields(
        { name: '📄 Détail', value: details, inline: false },
        { name: '👤 Client', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🕒 Ouvert le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '🟢 Statut', value: '⏳ En attente d’un staff...', inline: true }
      )
      .setFooter({ text: 'NXST RP • Boutique Officielle', iconURL: LOGO })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim-ticket').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('🧑‍💻'),
      new ButtonBuilder().setCustomId('ajouter-utilisateur').setLabel('Ajouter un utilisateur').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
      new ButtonBuilder().setCustomId('close-ticket').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    await channel.send({ embeds: [embedShop], components: [row] });
    await interaction.reply({ content: `Ticket boutique créé avec succès : <#${channel.id}>`, flags: 64 });

    queue.resetQueue(channel.id);

    await logTicketAction(
      interaction.guild,
      process.env.LOGS_TICKET_CHANNEL_ID,
      'Ouverture',
      interaction.user,
      channel,
      `Boutique - Produit : ${produit}`
    );

    logger(`Ticket boutique ouvert par ${interaction.user.tag} (${interaction.user.id}) [Achat: ${produit}]`);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal-probleme-boutique') {
    const probleme = interaction.fields.getTextInputValue('probleme');
    const category = getCategory(interaction, "boutique");
    const existing = interaction.guild.channels.cache.find(
      c => c.parentId === category?.id &&
           c.name.includes(interaction.user.username.toLowerCase()) &&
           c.type === ChannelType.GuildText &&
           c.permissionsFor(interaction.user.id).has(PermissionFlagsBits.ViewChannel)
    );
    if (existing) {
      await interaction.reply({ content: `❌ Tu as déjà un ticket ouvert ici : <#${existing.id}>\nMerci de le fermer avant d'en ouvrir un autre.`, flags: 64 });
      return;
    }

    const channel = await interaction.guild.channels.create({
      name: `❗-ticket-boutique-prob-${interaction.user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: category?.id ?? null,
      topic: `Ticket boutique (problème) ouvert par ${interaction.user.tag}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ...process.env.ROLES_STAFF.split(',').map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
      ]
    });

    const embedProb = new EmbedBuilder()
      .setColor(hexToDecimalColor(COULEURS.error))
      .setTitle('❗ PROBLÈME BOUTIQUE — NXST RP')
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setDescription([
        "═════════════════════════════════════════════",
        "🚨 **Un problème boutique a été signalé !**",
        "╭─────────────────────────────╮",
        `❗ **Problème** : ${probleme}`,
        "╰─────────────────────────────╯"
      ].join('\n'))
      .addFields(
        { name: '👤 Client', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🕒 Ouvert le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '🟢 Statut', value: '⏳ En attente d’un staff...', inline: true }
      )
      .setFooter({ text: 'NXST RP • Boutique — Log Alerte', iconURL: LOGO })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim-ticket').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('🧑‍💻'),
      new ButtonBuilder().setCustomId('ajouter-utilisateur').setLabel('Ajouter un utilisateur').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
      new ButtonBuilder().setCustomId('close-ticket').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    await channel.send({ embeds: [embedProb], components: [row] });
    await interaction.reply({ content: `Ticket problème boutique créé avec succès : <#${channel.id}>`, flags: 64 });

    queue.resetQueue(channel.id);

    await logTicketAction(
      interaction.guild,
      process.env.LOGS_TICKET_CHANNEL_ID,
      'Ouverture',
      interaction.user,
      channel,
      `Boutique - Problème signalé`
    );

    logger(`Ticket boutique (problème) ouvert par ${interaction.user.tag} (${interaction.user.id})`);
    return;
  }

  // --- Fermeture ticket modal ---
  if (interaction.isButton() && interaction.customId === 'close-ticket') {
    const modal = new ModalBuilder()
      .setCustomId('close-ticket-modal')
      .setTitle('Fermeture du ticket')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('raison_fermeture')
            .setLabel('Pourquoi fermer ce ticket ?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );
    await interaction.showModal(modal);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'close-ticket-modal') {
    const raisonFermeture = interaction.fields.getTextInputValue('raison_fermeture');
    const channel = interaction.channel;
    const user = interaction.user;
    const ticketMsg = (await channel.messages.fetch({ limit: 10 })).find(m => m.embeds.length > 0);
    const oldEmbed = ticketMsg ? ticketMsg.embeds[0] : null;

    const closeEmbed = new EmbedBuilder()
      .setColor(hexToDecimalColor(COULEURS.error))
      .setTitle("Ticket Fermé — NXST RP")
      .setDescription("Ce ticket a été fermé.\nMerci pour votre demande !")
      .addFields(
        ...(oldEmbed?.fields ?? []),
        { name: "Raison de fermeture", value: raisonFermeture, inline: false }
      )
      .setFooter({ text: `Fermé par ${user.tag} — NXST RP`, iconURL: LOGO })
      .setTimestamp();

    const disabledComponents = ticketMsg.components.map(row =>
      new ActionRowBuilder().addComponents(
        ...row.components.map(btn =>
          ButtonBuilder.from(btn).setDisabled(true)
        )
      )
    );

    await ticketMsg.edit({ embeds: [closeEmbed], components: disabledComponents });
    await interaction.reply({ content: "Ticket fermé. Merci pour votre retour !", flags: 64 });

    await logTicketAction(
      interaction.guild,
      process.env.LOGS_TICKET_CHANNEL_ID,
      'Fermeture',
      interaction.user,
      interaction.channel,
      `Raison : ${raisonFermeture}`
    );

    setTimeout(() => channel.delete(), 7000);
    return;
  }
}

module.exports = { handleInteraction };
