import { connectToDatabase, disconnectFromDatabase } from '../../src/config/database';


// Mock the database module
jest.mock('../../src/config/database', () => ({
  connectToDatabase: jest.fn(() => Promise.resolve()),
  disconnectFromDatabase: jest.fn(() => Promise.resolve()),
}));

describe('Mocked Database connection', () => {
  it('should call connectToDatabase successfully', async () => {
    await connectToDatabase();
    expect(connectToDatabase).toHaveBeenCalledTimes(1);
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    expect(disconnectFromDatabase).toHaveBeenCalledTimes(1);
  });
});
