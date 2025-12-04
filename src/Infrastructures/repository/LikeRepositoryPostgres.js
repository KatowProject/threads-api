const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, nanoid) {
    super();
    this._pool = pool;
    this._nanoid = nanoid;
  }

  async toggleLike(userId, commentId) {
    // Check if the user already liked the comment
    const checkQuery = {
      text: 'SELECT id FROM user_comment_likes WHERE "userId" = $1 AND "commentId" = $2',
      values: [userId, commentId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount) {
      // Unlike: remove the like
      const deleteQuery = {
        text: 'DELETE FROM user_comment_likes WHERE "userId" = $1 AND "commentId" = $2',
        values: [userId, commentId],
      };
      await this._pool.query(deleteQuery);
    } else {
      // Like: add the like
      const id = `like-${this._nanoid(16)}`;
      const insertQuery = {
        text: 'INSERT INTO user_comment_likes (id, "userId", "commentId") VALUES ($1, $2, $3)',
        values: [id, userId, commentId],
      };
      await this._pool.query(insertQuery);
    }
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_comment_likes WHERE "commentId" = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (commentIds.length === 0) {
      return [];
    }

    const query = {
      text: `SELECT "commentId", COUNT(*) as count 
             FROM user_comment_likes 
             WHERE "commentId" = ANY($1::text[])
             GROUP BY "commentId"`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    // Create a map for quick lookup
    const likeCounts = {};
    result.rows.forEach((row) => {
      likeCounts[row.commentId] = parseInt(row.count, 10);
    });

    // Return counts for all comment ids (0 if not found)
    return commentIds.map((id) => ({
      commentId: id,
      likeCount: likeCounts[id] || 0,
    }));
  }

  async isLiked(userId, commentId) {
    const query = {
      text: 'SELECT id FROM user_comment_likes WHERE "userId" = $1 AND "commentId" = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }
}

module.exports = LikeRepositoryPostgres;
