module.exports = class CreatedThread {
    constructor(payload) {
        const { id, title, body, username, updated_at } = payload;

        this._deletedComment = '[deleted comment]';
        this.deletedReplyComment = '[deleted reply]';

        this.id = id;
        this.title = title;
        this.body = body;
        this.date = updated_at;
        this.username = username;
        this.comments = this._arrangeComments(payload.comments || []);

        this._verifyPayload(payload);
    }

    _arrangeComments(comments) {
        return comments
            .filter(r => r.commentId && !r.parentCommentId)
            .map((comment) => ({
                id: comment.commentId,
                username: comment.username,
                date: comment.created_at,
                content: comment.is_deleted ? this._deletedComment : comment.content,
                replies: this._arrangeReplies(comment.commentId, comments),
            }));
    }

    _arrangeReplies(parentCommentId, comments) {
        return comments
            .filter((r) => r.parentCommentId === parentCommentId)
            .map((reply) => ({
                id: reply.commentId,
                username: reply.username,
                date: reply.created_at,
                content: reply.is_deleted ? this.deletedReplyComment : reply.content,
            }));
    }

    _verifyPayload({ id, title, body, username, updated_at, comments }) {
        if (!id || !title || !body || !username || !updated_at) {
            throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' ||
            typeof title !== 'string' ||
            typeof body !== 'string' ||
            typeof username !== 'string' ||
            !(updated_at instanceof Date)) {
            throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (comments) {
            comments.forEach((comment) => this._verifyComment(comment));
        }
    }

    _verifyComment(comment) {
        if (!comment.id || typeof comment.id !== 'string' ||
            !comment.username || typeof comment.username !== 'string' ||
            !comment.date || !(comment.date instanceof Date) ||
            !comment.content || typeof comment.content !== 'string') {
            throw new Error('DETAIL_THREAD.COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (comment.replies) {
            comment.replies.forEach((reply) => this._verifyReply(reply));
        }
    }

    _verifyReply(reply) {
        if (!reply.id || typeof reply.id !== 'string' ||
            !reply.username || typeof reply.username !== 'string' ||
            !reply.date || !(reply.date instanceof Date) ||
            !reply.content || typeof reply.content !== 'string') {
            throw new Error('DETAIL_THREAD.REPLY_NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }

}