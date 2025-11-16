const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');
const ViewThreadByIdUseCase = require('../../../../Applications/use_case/ViewThreadByIdUseCase');
const autoBind = require('../../../../Commons/utils/autoBind');

module.exports = class ThreadHandler {
    constructor(container) {
        this._container = container;

        autoBind(this);
    }

    async postThreadHandler(request, h) {
        const useCasePayload = {
            ...request.payload,
            userId: request.auth.credentials.id,
        };

        const createThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
        const createdThread = await createThreadUseCase.execute(useCasePayload);

        const addedThread = {
            id: createdThread.id,
            title: createdThread.title,
            owner: createdThread.userId,
        };

        return h.response({
            status: 'success',
            data: {
                addedThread,
            },
        }).code(201);
    }

    async getThreadByIdHandler(request, h) {
        const { threadId } = request.params;

        const viewThreadByIdUseCase = this._container.getInstance(ViewThreadByIdUseCase.name);
        const threadDetail = await viewThreadByIdUseCase.execute(threadId);

        return h.response({
            status: 'success',
            data: {
                thread: threadDetail,
            },
        }).code(200);
    }
};