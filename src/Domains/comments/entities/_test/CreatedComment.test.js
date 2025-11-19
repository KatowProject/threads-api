const CreatedComment = require('../CreatedComment');

describe('a CreatedComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'a comment',
    };

    // Action and Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 123,
      userId: 'user-123',
    };

    // Action and Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create createdComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'a comment',
      userId: 'user-123',
    };

    // Action
    const createdComment = new CreatedComment(payload);

    // Assert
    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.userId).toEqual(payload.userId);
  });
});
