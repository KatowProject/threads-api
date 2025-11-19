const { DeleteComment } = require('../../Domains/comments/entities');

module.exports = class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const { threadId, commentId, userId } = new DeleteComment(useCasePayload);

        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyAvailableComment(commentId);
        await this._commentRepository.verifyCommentOwner(commentId, userId);

        return this._commentRepository.deleteComment(commentId);
    }
};