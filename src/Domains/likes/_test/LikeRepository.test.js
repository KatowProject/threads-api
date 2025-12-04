const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
    it('should throw error when invoke abstract behavior', async () => {
        // Arrange
        const likeRepository = new LikeRepository();

        // Action and Assert
        await expect(likeRepository.toggleLike('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(likeRepository.getLikeCountByCommentId('')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(likeRepository.getLikeCountsByCommentIds([])).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(likeRepository.isLiked('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});
