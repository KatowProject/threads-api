const { CreateComment } = require('../../Domains/comments/entities');

module.exports = class AddCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const { threadId } = useCasePayload;

        const createComment = new CreateComment(useCasePayload);
        await this._threadRepository.verifyThreadExists(threadId);
        return this._commentRepository.addComment(createComment);
    }
};