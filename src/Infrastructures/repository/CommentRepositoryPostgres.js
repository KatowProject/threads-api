const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const { CreatedComment } = require('../../Domains/comments/entities');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, nanoid) {
    super();
    this._pool = pool;
    this._nanoid = nanoid;
  }

  async addComment(payload) {
    const { content, threadId, userId } = payload;
    const id = `comment-${this._nanoid(16)}`;

    const query = {
      text: 'INSERT INTO comments (id, content, "threadId", "userId") VALUES ($1, $2, $3, $4) RETURNING id, content, "userId"',
      values: [id, content, threadId, userId],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, c.content, c.created_at AS date, u.username, c.is_deleted
             FROM comments c
              LEFT JOIN users u ON c."userId" = u.id
             WHERE c."threadId" = $1
             ORDER BY c.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND "userId" = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyAvailableComment(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_deleted = false',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
