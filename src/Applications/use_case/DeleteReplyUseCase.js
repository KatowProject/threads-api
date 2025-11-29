const { DeleteReply } = require('../../Domains/replies/entities');

module.exports = class DeleteReplyUseCase {
    constructor({ repliesRepository, commentRepository, threadRepository }) {
        this._repliesRepository = repliesRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(payload) {
        const deleteReply = new DeleteReply(payload);

        
        await this._threadRepository.verifyThreadExists(deleteReply.threadId);
        await this._commentRepository.verifyAvailableComment(deleteReply.commentId);
        await this._repliesRepository.verifyAvailableReply(deleteReply.replyId);
        await this._repliesRepository.verifyReplyOwner(deleteReply.replyId, deleteReply.userId);

        return this._repliesRepository.deleteReply(deleteReply.replyId);
    }
};