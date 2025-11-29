const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const { CreatedThread, ThreadDetail } = require('../../Domains/threads/entities');

module.exports = class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, nanoid) {
        super();
        this._pool = pool;
        this._nanoid = nanoid;
    }

    async createThread(payload) {
        const { title, body, userId } = payload;

        const id = `thread-${this._nanoid(20)}`;
        const query = {
            text: 'INSERT INTO threads (id, title, body, "userId") VALUES ($1, $2, $3, $4) RETURNING id, title, body, "userId" AS "userId", created_at AS date',
            values: [id, title, body, userId],
        };

        const result = await this._pool.query(query);

        return new CreatedThread({ ...result.rows[0] });
    }

    async viewThreadById(id) {
        // Query untuk thread dan comments
        const threadQuery = {
            text: `
                SELECT 
                    threads.id, 
                    threads.title, 
                    threads.body, 
                    threads.updated_at, 
                    thread_users.username, 
                    comments.id AS comment_id, 
                    comment_users.username AS comment_username, 
                    comments.updated_at AS comment_date, 
                    comments.content, 
                    comments.is_deleted 
                FROM threads 
                LEFT JOIN users AS thread_users ON threads."userId" = thread_users.id 
                LEFT JOIN comments ON comments."threadId" = threads.id 
                LEFT JOIN users AS comment_users ON comments."userId" = comment_users.id 
                WHERE threads.id = $1
                ORDER BY comments.created_at ASC
            `,
            values: [id],
        };

        const threadResult = await this._pool.query(threadQuery);

        if (!threadResult.rowCount) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        // Query untuk replies
        const repliesQuery = {
            text: `
                SELECT 
                    replies.id AS reply_id,
                    replies."commentId" AS comment_id,
                    replies.content,
                    replies.is_deleted,
                    replies.updated_at AS reply_date,
                    reply_users.username AS reply_username
                FROM replies
                LEFT JOIN users AS reply_users ON replies."userId" = reply_users.id
                LEFT JOIN comments ON replies."commentId" = comments.id
                WHERE comments."threadId" = $1
                ORDER BY replies.created_at ASC
            `,
            values: [id],
        };

        const repliesResult = await this._pool.query(repliesQuery);

        return new ThreadDetail(threadResult.rows, repliesResult.rows);
    }

    async verifyThreadExists(id) {
        const query = {
            text: 'SELECT id FROM threads WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Thread tidak ditemukan');
        }
    }
}