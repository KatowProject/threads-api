/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - migration helper toolkit
 * @returns {Promise<void>|void} may return a promise if asynchronous operations are used
 */
exports.up = pgm => {
    pgm.createTable('threads', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        title: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        body: {
            type: 'TEXT',
            notNull: true,
        },
        "userId": {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
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
    pgm.dropTable('threads');
};
