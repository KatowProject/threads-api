module.exports = class CreatedComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, content, userId } = payload;

        this.id = id;
        this.content = content;
        this.userId = userId;
    }

    _verifyPayload(payload) {
        const { id, content, userId } = payload;

        if (!id || !content || !userId) {
            throw new Error('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string' || typeof userId !== 'string' ) {
            throw new Error('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
};
