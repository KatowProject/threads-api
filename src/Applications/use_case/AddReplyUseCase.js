const { AddReply } = require('../../Domains/replies/entities');

module.exports = class AddReplyUseCase {
    constructor({ repliesRepository, commentRepository, threadRepository }) {
        this._repliesRepository = repliesRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(payload) {
        
        await this._threadRepository.verifyThreadExists(payload.threadId);

        const addReply = new AddReply(payload);
        await this._commentRepository.verifyAvailableComment(addReply.commentId);

        return this._repliesRepository.addReply(addReply);
    }
};