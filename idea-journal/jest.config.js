export default {
  transform: {},
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};