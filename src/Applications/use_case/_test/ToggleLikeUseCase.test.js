const { ToggleLike } = require('../../../Domains/likes/entities');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
    it('should orchestrating the toggle like action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        };

        /** creating dependency of use case */
        const mockLikeRepository = new LikeRepository();
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.verifyThreadExists = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyAvailableComment = jest.fn().mockImplementation(() => Promise.resolve());
        mockLikeRepository.toggleLike = jest.fn().mockImplementation(() => Promise.resolve());

        /** creating use case instance */
        const toggleLikeUseCase = new ToggleLikeUseCase({
            likeRepository: mockLikeRepository,
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action
        await toggleLikeUseCase.execute(useCasePayload);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.commentId);
        expect(mockLikeRepository.toggleLike).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
    });

    it('should throw error when thread does not exist', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        };

        /** creating dependency of use case */
        const mockLikeRepository = new LikeRepository();
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.verifyThreadExists = jest.fn().mockImplementation(() => Promise.reject(new Error('thread not found')));

        /** creating use case instance */
        const toggleLikeUseCase = new ToggleLikeUseCase({
            likeRepository: mockLikeRepository,
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action & Assert
        await expect(toggleLikeUseCase.execute(useCasePayload)).rejects.toThrowError('thread not found');
    });

    it('should throw error when comment does not exist', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        };

        /** creating dependency of use case */
        const mockLikeRepository = new LikeRepository();
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.verifyThreadExists = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyAvailableComment = jest.fn().mockImplementation(() => Promise.reject(new Error('comment not found')));

        /** creating use case instance */
        const toggleLikeUseCase = new ToggleLikeUseCase({
            likeRepository: mockLikeRepository,
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action & Assert
        await expect(toggleLikeUseCase.execute(useCasePayload)).rejects.toThrowError('comment not found');
    });
});
