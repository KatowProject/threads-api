const { CreateComment, CreatedComment } = require('../../../Domains/comments/entities');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
    it('should orchestrating the add comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            content: 'a comment',
            threadId: 'thread-123',
            userId: 'user-123',
        };

        const expectedCreatedComment = new CreatedComment({
            id: 'comment-123',
            content: useCasePayload.content,
            userId: useCasePayload.userId,
        });

        /** creating dependency of use case */
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.verifyThreadExists = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(
            new CreatedComment({
                id: 'comment-123',
                content: useCasePayload.content,
                userId: useCasePayload.userId,
            })
        ));

        /** creating use case instance */
        const addCommentUseCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action
        const createdComment = await addCommentUseCase.execute(useCasePayload);

        // Assert
        expect(createdComment).toStrictEqual(expectedCreatedComment);
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment(useCasePayload));
    });
});
