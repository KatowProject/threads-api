const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('toggleLike', () => {
    it('should add like when user has not liked the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.toggleLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeByUserAndComment('user-123', 'comment-123');
      expect(likes).toHaveLength(1);
    });

    it('should remove like when user has already liked the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });

      const fakeIdGenerator = () => '456';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.toggleLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeByUserAndComment('user-123', 'comment-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('should return 0 when no likes exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(count).toBe(0);
    });

    it('should return correct like count', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-456', userId: 'user-456', commentId: 'comment-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('getLikeCountsByCommentIds', () => {
    it('should return empty array when commentIds is empty', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.getLikeCountsByCommentIds([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return correct like counts for multiple comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', content: 'another comment', threadId: 'thread-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-1', userId: 'user-123', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', userId: 'user-456', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-3', userId: 'user-123', commentId: 'comment-456' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123', 'comment-456']);

      // Assert
      expect(result).toEqual([
        { commentId: 'comment-123', likeCount: 2 },
        { commentId: 'comment-456', likeCount: 1 },
      ]);
    });

    it('should return 0 for comments with no likes', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123']);

      // Assert
      expect(result).toEqual([{ commentId: 'comment-123', likeCount: 0 }]);
    });
  });

  describe('isLiked', () => {
    it('should return false when user has not liked the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.isLiked('user-123', 'comment-123');

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when user has liked the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a title', body: 'a body', userId: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'a comment', threadId: 'thread-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.isLiked('user-123', 'comment-123');

      // Assert
      expect(result).toBe(true);
    });
  });
});
