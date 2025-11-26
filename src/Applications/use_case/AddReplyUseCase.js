const { AddReply } = require('../../Domains/replies/entities');

module.exports = class AddReplyUseCase {
    constructor({ replyRepository, commentRepository, threadRepository }) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(payload) {
        const addReply = new AddReply(payload);

        await this._threadRepository.verifyThreadExists(addReply.threadId);
        await this._commentRepository.verifyAvailableComment(addReply.commentId);

        return this._replyRepository.addReply(addReply);
    }
};