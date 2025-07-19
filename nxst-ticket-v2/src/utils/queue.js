const queues = {};

function getQueue(channelId) {
  if (!queues[channelId]) queues[channelId] = [];
  return queues[channelId];
}

function addToQueue(channelId, userId) {
  const queue = getQueue(channelId);
  if (!queue.includes(userId)) queue.push(userId);
  return queue;
}

function removeFromQueue(channelId, userId) {
  const queue = getQueue(channelId);
  const idx = queue.indexOf(userId);
  if (idx !== -1) queue.splice(idx, 1);
  return queue;
}

function nextInQueue(channelId) {
  const queue = getQueue(channelId);
  return queue.length > 0 ? queue[0] : null;
}

function resetQueue(channelId) {
  queues[channelId] = [];
}

module.exports = {
  getQueue,
  addToQueue,
  removeFromQueue,
  nextInQueue,
  resetQueue
};
