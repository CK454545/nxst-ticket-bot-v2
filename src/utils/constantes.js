const EMOJIS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  urgent: "🚨",
  normal: "🟠",
  faible: "🟢",
  claim: "🛠️",
  bug: "🐞",
  rp: "🎭",
  hrp: "💬",
  plainte: "⚠️",
  recrutement: "📝",
  entreprise: "🏢",
  gang: "🔫",
  autres: "🌐"
};

const COULEURS = {
  principal: "#19c37d",
  urgent: "#ff0000",
  normal: "#ff9000",
  faible: "#2ecc71",
  logs: "#7289da",
  plainte: "#ff0066",
  bug: "#ff4500",
  recrutement: "#007bff",
  entreprise: "#ffa500",
  gang: "#8b0000",
  autres: "#808080"
};

const PRIORITES = {
  urgent: {
    emoji: EMOJIS.urgent,
    label: "Urgent",
    couleur: COULEURS.urgent,
    nom: `${EMOJIS.urgent}-ticket-support-`
  },
  normal: {
    emoji: EMOJIS.normal,
    label: "Normal",
    couleur: COULEURS.normal,
    nom: `${EMOJIS.normal}-ticket-support-`
  },
  faible: {
    emoji: EMOJIS.faible,
    label: "Faible",
    couleur: COULEURS.faible,
    nom: `${EMOJIS.faible}-ticket-support-`
  },
  bug: {
    emoji: EMOJIS.bug,
    label: "Bug",
    couleur: COULEURS.bug,
    nom: `${EMOJIS.bug}-ticket-support-`
  },
  plainte: {
    emoji: EMOJIS.plainte,
    label: "Plainte",
    couleur: COULEURS.plainte,
    nom: `${EMOJIS.plainte}-ticket-support-`
  },
  recrutement: {
    emoji: EMOJIS.recrutement,
    label: "Recrutement",
    couleur: COULEURS.recrutement,
    nom: `${EMOJIS.recrutement}-ticket-support-`
  },
  entreprise: {
    emoji: EMOJIS.entreprise,
    label: "Entreprise",
    couleur: COULEURS.entreprise,
    nom: `${EMOJIS.entreprise}-ticket-support-`
  },
  gang: {
    emoji: EMOJIS.gang,
    label: "Gang",
    couleur: COULEURS.gang,
    nom: `${EMOJIS.gang}-ticket-support-`
  },
  autres: {
    emoji: EMOJIS.autres,
    label: "Autres",
    couleur: COULEURS.autres,
    nom: `${EMOJIS.autres}-ticket-support-`
  }
};

module.exports = { EMOJIS, COULEURS, PRIORITES };
