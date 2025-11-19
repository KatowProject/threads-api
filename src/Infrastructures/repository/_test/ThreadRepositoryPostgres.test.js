const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { CreateThread } = require('../../../Domains/threads/entities');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const createThread = new CreateThread({ title: 'a title', body: 'a body', userId: 'user-123' });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.createThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(createdThread.id).toBe('thread-123');
      expect(createdThread.title).toBe('a title');
      expect(createdThread.body).toBe('a body');
      expect(createdThread.userId).toBe('user-123');
    });
  });

  describe('viewThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.viewThreadById('thread-999')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'commenter' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', content: 'first comment', threadId: 'thread-123', userId: 'user-456', parentCommentId: null, is_deleted: false });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.viewThreadById('thread-123');

      // Assert basic properties
      expect(threadDetail).toBeDefined();
      expect(threadDetail.id).toBe('thread-123');
      expect(threadDetail.title).toBe('a title');
      expect(threadDetail.body).toBe('a body');
      expect(threadDetail.username).toBe('dicoding');
      // comments should be arranged as array
      expect(Array.isArray(threadDetail.comments)).toBe(true);
      expect(threadDetail.comments.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-999')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.toBeUndefined();
    });
  });
});
