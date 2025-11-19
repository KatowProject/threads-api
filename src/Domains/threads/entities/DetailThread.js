class DetailThread {
    constructor(payload) {
        if (Array.isArray(payload)) {
            // DB rows array mode
            if (!payload || payload.length === 0) {
                throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
            }

            const first = payload[0];

            const { id, title, body, updated_at, username } = first;

            // set basic fields
            this.id = id;
            this.title = title;
            this.body = body;
            this.date = updated_at;
            this.username = username;

            this.comments = this._arrangeComments(payload);

            this._verifyPayload({
                id: this.id,
                title: this.title,
                body: this.body,
                updated_at: this.date,
                username: this.username,
                comments: this.comments,
            });
        } else {
            // object payload mode
            if (!payload || !payload.id || !payload.title || !payload.body || !payload.username || !payload.updated_at) {
                throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
            }

            const { id, title, body, updated_at, username } = payload;

            // type checks: updated_at must be Date instance in object-mode (per tests)
            if (
                typeof id !== 'string' ||
                typeof title !== 'string' ||
                typeof body !== 'string' ||
                typeof username !== 'string' ||
                !(updated_at instanceof Date)
            ) {
                throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
            }

            this.id = id;
            this.title = title;
            this.body = body;
            this.date = updated_at;
            this.username = username;

            this.comments = this._arrangeComments(payload.comments || []);

            this._verifyPayload({
                id: this.id,
                title: this.title,
                body: this.body,
                updated_at: this.date,
                username: this.username,
                comments: this.comments,
            });
        }
    }

    _arrangeComments(comments) {
        if (!Array.isArray(comments) || comments.length === 0) return [];

        const normalized = this._normalizeComments(comments).filter((c) => c && c.commentId != null);

        return normalized
            .filter((c) => c.parentCommentId === null)
            .map((c) => ({
                id: c.commentId,
                username: c.username,
                date: c.date,
                content: c.is_deleted === false ? c.content : "**komentar telah dihapus**",
                replies: this._processReplies(c.commentId, normalized),
            }));
    }

    _processReplies(parentCommentId, comments) {
        if (!Array.isArray(comments) || comments.length === 0) return [];

        const normalized = this._normalizeComments(comments).filter((c) => c && c.commentId != null);

        return normalized
            .filter((c) => c.parentCommentId === parentCommentId && c.commentId !== parentCommentId)
            .map((c) => ({
                id: c.commentId,
                username: c.username,
                date: c.date,
                content: c.is_deleted === false ? c.content : "**balasan telah dihapus**",
                replies: this._processReplies(c.commentId, normalized),
            }));
    }

    _normalizeComments(comments) {
        return comments.map((c) => {
            if (c == null) return c;
            // DB row shape
            if (c.comment_id !== undefined && c.comment_id !== null) {
                return {
                    commentId: c.comment_id,
                    parentCommentId: c.parent_comment_id,
                    date: c.comment_date,
                    is_deleted: c.is_deleted,
                    content: c.content,
                    username: c.comment_username,
                    id: c.comment_id,
                };
            }

            // object shape (camelCase)
            return {
                commentId: c.commentId,
                parentCommentId: c.parentCommentId,
                date: c.date || c.created_at,
                is_deleted: c.is_deleted === undefined ? false : c.is_deleted,
                content: c.content,
                username: c.username || c.comment_username,
                id: c.id || c.commentId,
            };
        });
    }

    _verifyPayload({ id, title, body, updated_at, username, comments }) {
        if (
            !id ||
            !title ||
            !body ||
            !updated_at ||
            !username ||
            !Array.isArray(comments)
        ) {
            throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (
            typeof id !== 'string' ||
            typeof title !== 'string' ||
            typeof body !== 'string' ||
            isNaN(Date.parse(updated_at)) ||
            typeof username !== 'string'
        ) {
            throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (comments && comments.length > 0) {
            comments.forEach((comment) => {
                this._verifyComment(comment);
            });
        }
    }

    // Validate comments
    _verifyComment(comment) {
        if (!comment.id || typeof comment.id !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_COMMENT_ID`);
        }
        if (!comment.content || typeof comment.content !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_COMMENT_CONTENT`);
        }
        if (!comment.username || typeof comment.username !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_COMMENT_USERNAME`);
        }
        if (isNaN(Date.parse(comment.date))) {
            throw new Error(`DETAIL_THREAD.INVALID_COMMENT_DATE`);
        }

        if (comment.replies && Array.isArray(comment.replies)) {
            comment.replies.forEach((reply) => {
                this._verifyReply(reply);
            });
        }
    }

    // validate replies
    _verifyReply(reply) {
        if (!reply.id || typeof reply.id !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_REPLY_ID`);
        }
        if (!reply.content || typeof reply.content !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_REPLY_CONTENT`);
        }
        if (!reply.username || typeof reply.username !== 'string') {
            throw new Error(`DETAIL_THREAD.INVALID_REPLY_USERNAME`);
        }
        if (isNaN(Date.parse(reply.date))) {
            throw new Error(`DETAIL_THREAD.INVALID_REPLY_DATE`);
        }

        if (reply.replies && Array.isArray(reply.replies)) {
            reply.replies.forEach((nestedReply) => {
                this._verifyReply(nestedReply);
            });
        }
    }
}

module.exports = DetailThread;