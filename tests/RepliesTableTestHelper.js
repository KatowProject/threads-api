/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'a reply',
    commentId = 'comment-123',
    userId = 'user-123',
    is_deleted = false,
    created_at = null,
  } = {}) {
    const query = {
      text: 'INSERT INTO replies (id, content, "commentId", "userId", is_deleted, created_at) VALUES($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))',
      values: [id, content, commentId, userId, is_deleted, created_at],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
