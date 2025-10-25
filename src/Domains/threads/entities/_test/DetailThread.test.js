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

  it('should create detailThread object correctly with arranged comments and replies', () => {
    // Arrange: craft comments that satisfy both arrangement and verification
    const commentDate1 = new Date('2020-01-02');
    const replyDate = new Date('2020-01-03');

    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      updated_at: new Date('2020-01-01'),
      comments: [
        // top-level comment
        {
          commentId: 'comment-1',
          parentCommentId: null,
          created_at: commentDate1,
          is_deleted: false,
          content: 'first comment',
          username: 'user-1',
          // also include fields expected by _verifyComment
          id: 'comment-1',
          date: commentDate1,
        },
        // reply to comment-1
        {
          commentId: 'comment-2',
          parentCommentId: 'comment-1',
          created_at: replyDate,
          is_deleted: true,
          content: 'reply content',
          username: 'user-2',
          id: 'comment-2',
          date: replyDate,
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert basic fields
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.updated_at);
    expect(detailThread.username).toEqual(payload.username);

    // Assert comments arranged
    expect(Array.isArray(detailThread.comments)).toBe(true);
    expect(detailThread.comments).toHaveLength(1);

    const comment = detailThread.comments[0];
    expect(comment.id).toEqual('comment-1');
    expect(comment.username).toEqual('user-1');
    expect(comment.date).toEqual(commentDate1);
    expect(comment.content).toEqual('first comment');
    expect(Array.isArray(comment.replies)).toBe(true);
    expect(comment.replies).toHaveLength(1);

    const reply = comment.replies[0];
    expect(reply.id).toEqual('comment-2');
    expect(reply.username).toEqual('user-2');
    expect(reply.date).toEqual(replyDate);
    // reply is deleted, so content should be replaced with deleted reply marker
    expect(reply.content).toEqual('[deleted reply]');
  });
});
