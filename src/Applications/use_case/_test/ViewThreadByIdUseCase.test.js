const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ViewThreadByIdUseCase = require('../ViewThreadByIdUseCase');

describe('ViewThreadByIdUseCase', () => {
  it('should orchestrating the view thread by id action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockDate = new Date();

    const mockThread = {
      id: threadId,
      title: 'a title',
      body: 'a body',
      updated_at: mockDate,
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'user-1',
        date: mockDate,
        content: 'a comment',
        is_deleted: false,
      },
      {
        id: 'comment-2',
        username: 'user-2',
        date: mockDate,
        content: 'deleted comment',
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        commentId: 'comment-1',
        username: 'user-3',
        date: mockDate,
        content: 'a reply',
        is_deleted: false,
      },
      {
        id: 'reply-2',
        commentId: 'comment-1',
        username: 'user-4',
        date: mockDate,
        content: 'deleted reply',
        is_deleted: true,
      },
    ];

    const mockLikeCounts = [
      { commentId: 'comment-1', likeCount: 2 },
      { commentId: 'comment-2', likeCount: 1 },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockLikeCounts));

    const viewThreadByIdUseCase = new ViewThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const threadDetail = await viewThreadByIdUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
    expect(mockLikeRepository.getLikeCountsByCommentIds).toBeCalledWith(['comment-1', 'comment-2']);

    expect(threadDetail.id).toEqual(threadId);
    expect(threadDetail.title).toEqual('a title');
    expect(threadDetail.body).toEqual('a body');
    expect(threadDetail.date).toEqual(mockDate);
    expect(threadDetail.username).toEqual('dicoding');

    // Check comments
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].id).toEqual('comment-1');
    expect(threadDetail.comments[0].content).toEqual('a comment');
    expect(threadDetail.comments[0].likeCount).toEqual(2);
    expect(threadDetail.comments[1].id).toEqual('comment-2');
    expect(threadDetail.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(threadDetail.comments[1].likeCount).toEqual(1);

    // Check replies
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0].id).toEqual('reply-1');
    expect(threadDetail.comments[0].replies[0].content).toEqual('a reply');
    expect(threadDetail.comments[0].replies[1].id).toEqual('reply-2');
    expect(threadDetail.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');

    // Comment without replies should have empty array
    expect(threadDetail.comments[1].replies).toHaveLength(0);
  });

  it('should return thread with empty comments when no comments exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockDate = new Date();

    const mockThread = {
      id: threadId,
      title: 'a title',
      body: 'a body',
      updated_at: mockDate,
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const viewThreadByIdUseCase = new ViewThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const threadDetail = await viewThreadByIdUseCase.execute(threadId);

    // Assert
    expect(threadDetail.comments).toEqual([]);
  });
});
