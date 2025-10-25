const CreatedThread = require('../CreatedThread');

describe('a CreatedThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      // missing userId and date
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      userId: 'user-123',
      date: '2020-01-01',
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create createdThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      userId: 'user-123',
      date: new Date('2020-01-01'),
    };

    // Action
    const createdThread = new CreatedThread(payload);

    // Assert
    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.body).toEqual(payload.body);
    expect(createdThread.userId).toEqual(payload.userId);
    expect(createdThread.date).toEqual(payload.date);
  });
});
