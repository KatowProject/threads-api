const { AddedReply } = require('../../Domains/replies/entities');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

module.exports = class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, nanoid) {
        super();
        this._pool = pool;
        this._nanoid = nanoid;
    }

    async addReply(payload) {
        const { content, commentId, userId } = payload;
        const id = `reply-${this._nanoid(16)}`;

        const query = {
            text: 'INSERT INTO replies (id, content, "commentId", "userId") VALUES ($1, $2, $3, $4) RETURNING id, content, "userId"',
            values: [id, content, commentId, userId],
        };

        const result = await this._pool.query(query);

        return new AddedReply({ ...result.rows[0] });
    }

    async getRepliesByThreadId(threadId) {
        const query = {
            text: `
                SELECT 
                    replies.id,
                    replies."commentId" AS "commentId",
                    replies.content,
                    replies.is_deleted,
                    replies.updated_at AS date,
                    users.username
                FROM replies
                LEFT JOIN users ON replies."userId" = users.id
                LEFT JOIN comments ON replies."commentId" = comments.id
                WHERE comments."threadId" = $1
                ORDER BY replies.created_at ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async deleteReply(replyId) {
        const query = {
            text: 'UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Balasan tidak ditemukan');
        }
    }

    async verifyReplyOwner(replyId, userId) {
        const query = {
            text: 'SELECT * FROM replies WHERE id = $1 AND "userId" = $2',
            values: [replyId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new AuthorizationError('Anda tidak berhak mengakses balasan ini');
        }
    }

    async verifyAvailableReply(replyId) {
        const query = {
            text: 'SELECT * FROM replies WHERE id = $1 AND is_deleted = false',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Balasan tidak ditemukan');
        }
    }
};