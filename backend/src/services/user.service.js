const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserService {
    /**
     * Get full user profile including stats
     */
    async getProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                bio: true,
                bestSolve: true,
                totalSolves: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        friends: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Update user profile (username, bio)
     */
    async updateProfile(userId, data) {
        const updateData = {};

        if (data.username !== undefined) {
            // Check if username already exists
            const existing = await prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT: { id: userId }
                }
            });
            if (existing) {
                throw new Error('Username already taken');
            }
            updateData.username = data.username;
        }

        if (data.bio !== undefined) {
            updateData.bio = data.bio;
        }

        return await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                bio: true,
                bestSolve: true,
                totalSolves: true
            }
        });
    }

    /**
     * Get all posts by a specific user
     */
    async getUserPosts(userId, limit = 20, offset = 0) {
        return await prisma.post.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
            include: {
                user: {
                    select: { id: true, username: true, avatar: true, bestSolve: true }
                },
                comments: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                },
                likes: {
                    select: { userId: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });
    }

    /**
     * Get all posts liked by a specific user
     */
    async getLikedPosts(userId, limit = 20, offset = 0) {
        const likes = await prisma.like.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
            include: {
                post: {
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true, bestSolve: true }
                        },
                        comments: {
                            take: 3,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                user: {
                                    select: { id: true, username: true, avatar: true }
                                }
                            }
                        },
                        likes: {
                            select: { userId: true }
                        },
                        _count: {
                            select: { likes: true, comments: true }
                        }
                    }
                }
            }
        });

        return likes.map(like => like.post);
    }

    /**
     * Get user's friends list
     */
    async getUserFriends(userId) {
        const friendships = await prisma.friendship.findMany({
            where: { userId },
            include: {
                user: false
            }
        });

        const friendIds = friendships.map(f => f.friendId);

        return await prisma.user.findMany({
            where: { id: { in: friendIds } },
            select: {
                id: true,
                username: true,
                avatar: true,
                bestSolve: true,
                totalSolves: true
            }
        });
    }
}

module.exports = new UserService();
