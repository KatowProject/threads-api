const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const { CreatedThread } = require('../../Domains/threads/entities');

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

    async getThreadById(threadId) {
        const query = {
            text: `
                SELECT 
                    threads.id, 
                    threads.title, 
                    threads.body, 
                    threads.updated_at,
                    users.username
                FROM threads 
                LEFT JOIN users ON threads."userId" = users.id 
                WHERE threads.id = $1
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        return result.rows[0];
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