const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const { CreateComment } = require('../../../Domains/comments/entities');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist add comment and return created comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });

      const createComment = new CreateComment({ content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const created = await commentRepositoryPostgres.addComment(createComment);

      // Assert
      const result = await pool.query('SELECT * FROM comments WHERE id = $1', [created.id]);
      expect(result.rowCount).toEqual(1);
      expect(created.id).toBe('comment-123');
      expect(created.content).toBe('a comment');
      expect(created.threadId).toBe('thread-123');
      expect(created.userId).toBe('user-123');
      expect(created.date).toBeInstanceOf(Date);
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment not exists', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists('comment-999')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when the owner is not the comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'other' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', content: 'first comment', threadId: 'thread-123', userId: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-1', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when the owner is the comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', content: 'first comment', threadId: 'thread-123', userId: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert (should not throw)
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-1', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft-delete comment by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', content: 'first comment', threadId: 'thread-123', userId: 'user-123', is_deleted: false });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-1');

      // Assert
      const result = await pool.query('SELECT is_deleted FROM comments WHERE id = $1', ['comment-1']);
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].is_deleted).toBe(true);
    });
  });
});
