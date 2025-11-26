const { DeleteReply } = require('../../Domains/replies/entities');

module.exports = class DeleteReplyUseCase {
    constructor({ replyRepository, commentRepository, threadRepository }) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(payload) {
        const deleteReply = new DeleteReply(payload);

        await this._threadRepository.verifyThreadExists(deleteReply.threadId);
        await this._commentRepository.verifyAvailableComment(deleteReply.commentId);
        await this._replyRepository.verifyReplyOwner(deleteReply.replyId, deleteReply.userId);

        return this._replyRepository.deleteReply(deleteReply.replyId);
    }
};