const { ThreadDetail } = require('../../Domains/threads/entities');

module.exports = class ViewThreadByIdUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        const thread = await this._threadRepository.getThreadById(threadId);
        const comments = await this._commentRepository.getCommentsByThreadId(threadId);
        const replies = await this._replyRepository.getRepliesByThreadId(threadId);

        const commentsWithReplies = this._mapCommentsWithReplies(comments, replies);

        return new ThreadDetail({
            id: thread.id,
            title: thread.title,
            body: thread.body,
            date: thread.updated_at,
            username: thread.username,
            comments: commentsWithReplies,
        });
    }

    _mapCommentsWithReplies(comments, replies) {
        return comments.map((comment) => ({
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
            replies: this._getRepliesForComment(comment.id, replies),
        }));
    }

    _getRepliesForComment(commentId, replies) {
        return replies
            .filter((reply) => reply.commentId === commentId)
            .map((reply) => ({
                id: reply.id,
                username: reply.username,
                date: reply.date,
                content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
            }));
    }
}