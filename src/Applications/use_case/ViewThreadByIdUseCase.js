module.exports = class ViewThreadByIdUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(threadId) {
        return this._threadRepository.viewThreadById(threadId);
    }
}