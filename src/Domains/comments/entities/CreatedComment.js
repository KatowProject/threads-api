module.exports = class CreatedComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, content, threadId, userId, date } = payload;

        this.id = id;
        this.content = content;
        this.threadId = threadId;
        this.userId = userId;
        this.date = date;
    }

    _verifyPayload(payload) {
        const { id, content, threadId, userId, date } = payload;

        if (!id || !content || !threadId || !userId || !date) {
            throw new Error('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string' || typeof threadId !== 'string' || typeof userId !== 'string' || !(date instanceof Date)) {
            throw new Error('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
};
