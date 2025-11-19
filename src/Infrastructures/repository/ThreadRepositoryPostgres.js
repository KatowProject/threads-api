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
        const query = {
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
                    comments."parentCommentId" as parent_comment_id ,
                    comments.is_deleted 
                FROM threads 
                LEFT JOIN users AS thread_users ON threads."userId" = thread_users.id 
                LEFT JOIN comments ON comments."threadId" = threads.id 
                LEFT JOIN users AS comment_users ON comments."userId" = comment_users.id 
                WHERE threads.id = $1
            `,
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        return new ThreadDetail(result.rows);
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