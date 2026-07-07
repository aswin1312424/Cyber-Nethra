const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { role, email } = req.query;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // A user gets notifications addressed specifically to their email AND broadcasted to their role
    const query = {
      $or: [
        { recipientEmail: email, recipientRole: role },     // Specific to user
        { recipientEmail: null, recipientRole: role }       // Broadcast to entire role
      ]
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};
