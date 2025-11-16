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

  async addComment(newComment) {
    const { content, threadId, userId, parentCommentId = null } = newComment;

    const id = `comment-${this._nanoid(16)}`;

    const query = {
      text: 'INSERT INTO comments (id, content, "threadId", "userId", "parentCommentId") VALUES($1, $2, $3, $4, $5) RETURNING id, content, "threadId" AS "threadId", "userId" AS "userId", created_at AS date',
      values: [id, content, threadId, userId, parentCommentId],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT "userId" FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const [{ userId }] = result.rows;

    if (userId !== owner) {
      throw new AuthorizationError('anda bukan pemilik komentar');
    }
  }
}

module.exports = CommentRepositoryPostgres;
