const CreateComment = require('../CreateComment');

describe('a CreateComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'a comment',
      userId: 'user-123',
    };

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'a comment',
      threadId: 'thread-123',
      userId: 123,
    };

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create createComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'a comment',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    // Action
    const createComment = new CreateComment(payload);

    // Assert
    expect(createComment.content).toEqual(payload.content);
    expect(createComment.threadId).toEqual(payload.threadId);
    expect(createComment.userId).toEqual(payload.userId);
  });
});
