const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { CreateThread } = require('../../../Domains/threads/entities');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
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
      expect(createdThread.date).toBeDefined();
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-999'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toBe('thread-123');
      expect(thread.title).toBe('a title');
      expect(thread.body).toBe('a body');
      expect(thread.username).toBe('dicoding');
      expect(thread.updated_at).toBeDefined();
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-999'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
