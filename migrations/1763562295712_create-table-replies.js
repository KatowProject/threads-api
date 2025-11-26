/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('replies', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        "commentId": {
            type: 'VARCHAR(100)',
            notNull: true,
            references: '"comments"',
            onDelete: 'CASCADE',
        },
        "userId": {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
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

exports.down = pgm => {
    pgm.dropTable('replies');
};
