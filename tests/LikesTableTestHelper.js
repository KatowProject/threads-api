/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({ id = 'like-123', userId = 'user-123', commentId = 'comment-123' } = {}) {
    const query = {
      text: 'INSERT INTO user_comment_likes (id, "userId", "commentId") VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeByUserAndComment(userId, commentId) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE "userId" = $1 AND "commentId" = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_comment_likes WHERE "commentId" = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
