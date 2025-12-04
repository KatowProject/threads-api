const { ToggleLike } = require('../../Domains/likes/entities');

module.exports = class ToggleLikeUseCase {
    constructor({ likeRepository, commentRepository, threadRepository }) {
        this._likeRepository = likeRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const toggleLike = new ToggleLike(useCasePayload);
        
        // Verify thread exists
        await this._threadRepository.verifyThreadExists(toggleLike.threadId);
        
        // Verify comment exists and is not deleted
        await this._commentRepository.verifyAvailableComment(toggleLike.commentId);
        
        // Toggle like
        await this._likeRepository.toggleLike(toggleLike.userId, toggleLike.commentId);
    }
};
