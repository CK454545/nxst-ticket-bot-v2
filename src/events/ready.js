module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`🤖 Bot prêt et connecté en tant que ${client.user.tag}`);
  }
};
