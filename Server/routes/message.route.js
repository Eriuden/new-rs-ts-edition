
import { Conversation } from '../models/message.model';
import { Message } from '../models/message.model';
import { authenticateToken } from '../middleware/auth'; // ton middleware d'auth

const router = require("express").Router()

router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { recipientId } = req.body;

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Impossible de créer une conversation avec soi-même' });
    }

    
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 }
    })
      .populate('participants', 'username avatar')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId]
      });
      
      conversation = await conversation.populate('participants', 'username avatar');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
});


router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date() };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});


router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le message ne peut pas être vide' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim()
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt
    });

    const populatedMessage = await message.populate('sender', 'username avatar');

    const io = req.app.get('io');
    const recipientId = conversation.participants.find(p => p.toString() !== userId);
    io.to(recipientId.toString()).emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

router.put('/conversations/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des messages' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    const conversations = await Conversation.find({
      participants: userId
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
  }
});

module.exports = router