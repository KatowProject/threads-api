const DetailThread = require('../DetailThread');

describe('a DetailThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      // missing date, username, comments
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      date: '2020-01-01', // should be Date object
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when comments is not an array', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      date: new Date('2020-01-01'),
      comments: 'not an array',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly with empty comments', () => {
    // Arrange
    const mockDate = new Date('2020-01-01');
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      date: mockDate,
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual([]);
  });

  it('should create detailThread object correctly with comments and replies', () => {
    // Arrange
    const mockDate = new Date('2020-01-01');
    const commentDate = new Date('2020-01-02');
    const replyDate = new Date('2020-01-03');

    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      date: mockDate,
      comments: [
        {
          id: 'comment-1',
          username: 'user-1',
          date: commentDate,
          content: 'a comment',
          replies: [
            {
              id: 'reply-1',
              username: 'user-2',
              date: replyDate,
              content: 'a reply',
            },
          ],
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual('thread-123');
    expect(detailThread.comments).toHaveLength(1);
    expect(detailThread.comments[0].id).toEqual('comment-1');
    expect(detailThread.comments[0].replies).toHaveLength(1);
    expect(detailThread.comments[0].replies[0].id).toEqual('reply-1');
  });
});
