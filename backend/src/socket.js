const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Track online users: { oderId: socketId }
const onlineUsers = new Map();

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // User joins (authenticates)
        socket.on('user-online', (userId) => {
            if (userId) {
                onlineUsers.set(userId, socket.id);
                console.log(`User ${userId} is online`);

                // Broadcast online status to all
                io.emit('user-status-change', {
                    oderId: userId,
                    status: 'online'
                });
            }
        });

        // Send message
        socket.on('send-message', async (data) => {
            const { senderId, receiverId, content } = data;

            try {
                // Save to database
                const message = await prisma.message.create({
                    data: {
                        senderId,
                        receiverId,
                        content
                    },
                    include: {
                        sender: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                });

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive-message', message);
                }

                // Confirm to sender
                socket.emit('message-sent', message);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { senderId, receiverId, isTyping } = data;
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', {
                    userId: senderId,
                    isTyping
                });
            }
        });

        // Get online users
        socket.on('get-online-users', () => {
            socket.emit('online-users', Array.from(onlineUsers.keys()));
        });

        // Disconnect
        socket.on('disconnect', () => {
            // Find and remove user
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);

                    // Broadcast offline status
                    io.emit('user-status-change', {
                        userId,
                        status: 'offline'
                    });
                    break;
                }
            }
        });
    });

    return io;
}

module.exports = { initializeSocket, onlineUsers };
