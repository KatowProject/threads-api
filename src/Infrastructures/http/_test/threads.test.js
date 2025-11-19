const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUser,
      });

      // login to get access token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: requestUser.username, password: requestUser.password },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const requestPayload = {
        title: 'a title',
        body: 'a body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      // Arrange
      const requestUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUser,
      });

      // login to get access token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: requestUser.username, password: requestUser.password },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // create thread
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'a title', body: 'a body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(createThreadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(addedThread.id);
      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
    });
  });
});
