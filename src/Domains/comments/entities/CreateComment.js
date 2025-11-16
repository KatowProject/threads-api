module.exports = class CreateComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const { content, threadId, userId } = payload;

        this.content = content;
        this.threadId = threadId;
        this.userId = userId;
    }

    _verifyPayload(payload) {
        const { content, threadId, userId } = payload;

        if (!content || !threadId || !userId) {
            throw new Error('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof content !== 'string' || typeof threadId !== 'string' || typeof userId !== 'string') {
            throw new Error('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
};
