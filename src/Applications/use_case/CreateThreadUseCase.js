const { CreateThread } = require('../../Domains/threads/entities');

module.exports = class CreateThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const createdThread = new CreateThread(useCasePayload);
        return this._threadRepository.createThread(createdThread);
    }
}