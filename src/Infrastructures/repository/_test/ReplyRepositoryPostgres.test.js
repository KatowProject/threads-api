const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const { AddReply } = require('../../../Domains/replies/entities');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });

      const addReply = new AddReply({ content: 'a reply', commentId: 'comment-123', userId: 'user-123' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply.id).toBe('reply-123');
      expect(addedReply.content).toBe('a reply');
      expect(addedReply.owner).toBe('user-123');
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe('reply-123');
      expect(replies[0].content).toBe('a reply');
      expect(replies[0].username).toBe('dicoding');
    });
  });

  describe('deleteReply', () => {
    it('should soft-delete reply by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123', is_deleted: false });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toBe(true);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.deleteReply('reply-999')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError when owner is not the reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'other' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner is the reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('verifyAvailableReply', () => {
    it('should throw NotFoundError when reply not exists or deleted', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-999')).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123', is_deleted: true });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when reply exists and not deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'a reply', commentId: 'comment-123', userId: 'user-123', is_deleted: false });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-123')).resolves.not.toThrow();
    });
  });
});
