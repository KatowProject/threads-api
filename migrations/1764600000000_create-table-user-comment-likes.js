/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - migration helper toolkit
 * @returns {Promise<void>|void} may return a promise if asynchronous operations are used
 */
exports.up = pgm => {
    pgm.createTable('user_comment_likes', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        "userId": {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        "commentId": {
            type: 'VARCHAR(100)',
            notNull: true,
            references: '"comments"',
            onDelete: 'CASCADE',
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

    // Add unique constraint to prevent duplicate likes
    pgm.addConstraint('user_comment_likes', 'unique_user_comment_like', {
        unique: ['userId', 'commentId'],
    });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - migration helper toolkit
 * @returns {Promise<void>|void} may return a promise if asynchronous operations are used
 */
exports.down = pgm => {
    pgm.dropTable('user_comment_likes');
};
