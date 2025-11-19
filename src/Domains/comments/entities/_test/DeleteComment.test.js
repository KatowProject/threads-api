const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 123,
      userId: 'user-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteComment object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    // Action
    const deleteComment = new DeleteComment(payload);

    // Assert
    expect(deleteComment.commentId).toEqual(payload.commentId);
    expect(deleteComment.threadId).toEqual(payload.threadId);
    expect(deleteComment.userId).toEqual(payload.userId);
  });
});
