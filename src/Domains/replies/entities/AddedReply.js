module.exports = class AddedReply {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, content, userId } = payload;

        this.id = id;
        this.content = content;
        this.owner = userId;
    }

    _verifyPayload({ id, content, userId }) {
        if (!id || !content || !userId) {
            throw new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string' || typeof userId !== 'string') {
            throw new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
};