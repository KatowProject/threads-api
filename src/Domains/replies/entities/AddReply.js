module.exports = class AddReply {
    constructor(payload) {
        this._verifyPayload(payload);

        const { commentId, content, userId } = payload;

        this.commentId = commentId;
        this.content = content;
        this.userId = userId;
    }

    _verifyPayload({ commentId, content, userId }) {
        if (!commentId || !content || !userId) {
            throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof commentId !== 'string' || typeof content !== 'string' || typeof userId !== 'string') {
            throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
};