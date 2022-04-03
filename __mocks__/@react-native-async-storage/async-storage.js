// For some reason, this doesn't work anymore:
// export default from '@react-native-community/async-storage/jest/async-storage-mock';
// so we just mock it ourselves now.
//
// Source: https://github.com/react-native-async-storage/async-storage/issues/379#issuecomment-660478051

export default {
  getItem: async (...args) => args,
  setItem: async (...args) => args,
  removeItem: async (...args) => args,
};
