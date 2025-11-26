const AddReply = require('../AddReply');

describe('a AddReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'a reply',
      userId: 123,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addReply object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'a reply',
      userId: 'user-123',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply.commentId).toEqual(payload.commentId);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.userId).toEqual(payload.userId);
  });
});
