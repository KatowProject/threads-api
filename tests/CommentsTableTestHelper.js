/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', content = 'a comment', threadId = 'thread-123', userId = 'user-123', parentCommentId = null, is_deleted = false, created_at = null } = {}) {
    const query = {
      text: 'INSERT INTO comments (id, content, "threadId", "userId", "parentCommentId", is_deleted, created_at) VALUES($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))',
      values: [id, content, threadId, userId, parentCommentId, is_deleted, created_at],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
