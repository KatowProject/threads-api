const DetailThread = require('../DetailThread');

describe('a DetailThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      // missing username and updated_at
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
      updated_at: '2020-01-01',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly with empty comments', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      updated_at: new Date('2020-01-01'),
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.updated_at);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual([]);
  });

  it('should create detailThread object correctly with comments (object mode)', () => {
    // Arrange
    const commentDate = new Date('2020-01-02');

    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      updated_at: new Date('2020-01-01'),
      comments: [
        {
          commentId: 'comment-1',
          parentCommentId: null,
          created_at: commentDate,
          is_deleted: false,
          content: 'first comment',
          username: 'user-1',
          id: 'comment-1',
          date: commentDate,
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.comments).toHaveLength(1);
    expect(detailThread.comments[0].id).toEqual('comment-1');
    expect(detailThread.comments[0].content).toEqual('first comment');
    expect(detailThread.comments[0].replies).toEqual([]);
  });

  it('should create detailThread object correctly with DB rows and replies (array mode)', () => {
    // Arrange - DB rows format dari ThreadRepositoryPostgres
    const threadRows = [
      {
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        updated_at: new Date('2020-01-01'),
        username: 'dicoding',
        comment_id: 'comment-1',
        comment_username: 'user-1',
        comment_date: new Date('2020-01-02'),
        content: 'first comment',
        is_deleted: false,
      },
    ];

    const repliesRows = [
      {
        reply_id: 'reply-1',
        comment_id: 'comment-1',
        content: 'a reply',
        is_deleted: false,
        reply_date: new Date('2020-01-03'),
        reply_username: 'user-2',
      },
      {
        reply_id: 'reply-2',
        comment_id: 'comment-1',
        content: 'deleted reply',
        is_deleted: true,
        reply_date: new Date('2020-01-04'),
        reply_username: 'user-3',
      },
    ];

    // Action
    const detailThread = new DetailThread(threadRows, repliesRows);

    // Assert basic fields
    expect(detailThread.id).toEqual('thread-123');
    expect(detailThread.title).toEqual('a title');
    expect(detailThread.body).toEqual('a body');
    expect(detailThread.username).toEqual('dicoding');

    // Assert comments
    expect(detailThread.comments).toHaveLength(1);
    const comment = detailThread.comments[0];
    expect(comment.id).toEqual('comment-1');
    expect(comment.content).toEqual('first comment');

    // Assert replies
    expect(comment.replies).toHaveLength(2);
    expect(comment.replies[0].id).toEqual('reply-1');
    expect(comment.replies[0].content).toEqual('a reply');
    expect(comment.replies[1].id).toEqual('reply-2');
    expect(comment.replies[1].content).toEqual('**balasan telah dihapus**');
  });

  it('should show deleted comment content as **komentar telah dihapus**', () => {
    // Arrange
    const threadRows = [
      {
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        updated_at: new Date('2020-01-01'),
        username: 'dicoding',
        comment_id: 'comment-1',
        comment_username: 'user-1',
        comment_date: new Date('2020-01-02'),
        content: 'deleted content',
        is_deleted: true,
      },
    ];

    // Action
    const detailThread = new DetailThread(threadRows, []);

    // Assert
    expect(detailThread.comments[0].content).toEqual('**komentar telah dihapus**');
  });
});
