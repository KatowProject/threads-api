/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - migration helper toolkit
 * @returns {Promise<void>|void} may return a promise if asynchronous operations are used
 */
exports.up = pgm => {
    pgm.createTable('comments', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        "threadId": {
            type: 'VARCHAR(100)',
            notNull: true,
            references: '"threads"',
            onDelete: 'CASCADE',
        },
        "userId": {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        "parentCommentId": {
            type: 'VARCHAR(100)',
            references: '"comments"',
            onDelete: 'CASCADE',
        },
        "is_deleted": {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },  
    });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - migration helper toolkit
 * @returns {Promise<void>|void}
 */
exports.down = pgm => {
    pgm.dropTable('comments');
};
