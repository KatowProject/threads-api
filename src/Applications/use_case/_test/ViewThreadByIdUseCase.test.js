const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const { ThreadDetail } = require('../../../Domains/threads/entities');
const ViewThreadByIdUseCase = require('../ViewThreadByIdUseCase');

describe('ViewThreadByIdUseCase', () => {
  it('should orchestrating the view thread by id action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockDate = new Date();

    const expectedThreadDetail = new ThreadDetail({
      id: threadId,
      title: 'a title',
      body: 'a body',
      updated_at: mockDate,
      username: 'dicoding',
      comments: [],
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.viewThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        new ThreadDetail({
          id: threadId,
          title: 'a title',
          body: 'a body',
          updated_at: mockDate,
          username: 'dicoding',
          comments: [],
        })
      ));

    const viewThreadByIdUseCase = new ViewThreadByIdUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadDetail = await viewThreadByIdUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.viewThreadById).toBeCalledWith(threadId);
  });
});
