const Notification = require('../models/Notification');

/**
 * Creates a notification in the DB and emits it via socket.io
 * @param {Object} io - the req.io instance
 * @param {Object} data - { recipientRole, recipientEmail, title, message, caseId, priority }
 */
exports.sendNotification = async (io, data) => {
  try {
    const notif = new Notification(data);
    await notif.save();

    console.log(`📡 Sending WebSocket Notification to [Role: ${data.recipientRole} | Email: ${data.recipientEmail || 'All'}]`);

    // Determine the room to emit to
    const room = data.recipientEmail ? data.recipientEmail : data.recipientRole;
    
    // Emit the notification payload to the specific room
    if (io) {
      io.to(room).emit('newNotification', notif);
    }
  } catch (error) {
    console.error("⚠️ Failed to send notification:", error.message);
  }
};
