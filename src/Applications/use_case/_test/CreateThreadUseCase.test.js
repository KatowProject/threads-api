const { CreateThread, CreatedThread } = require('../../../Domains/threads/entities');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThreadUseCase = require('../CreateThreadUseCase');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the create thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a title',
      body: 'a body',
      userId: 'user-123',
    };

    const mockDate = new Date();

    const expectedCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      userId: useCasePayload.userId,
      date: mockDate,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.createThread = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new CreatedThread({
          id: 'thread-123',
          title: useCasePayload.title,
          body: useCasePayload.body,
          userId: useCasePayload.userId,
          date: mockDate,
        })
      ));

    /** creating use case instance */
    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await createThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(expectedCreatedThread);
    expect(mockThreadRepository.createThread).toBeCalledWith(new CreateThread(useCasePayload));
  });
});
