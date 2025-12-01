const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
    it('should throw error when invoke abstract behavior', async () => {
        const threadRepository = new ThreadRepository();

        await expect(threadRepository.createThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.verifyThreadExists('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});