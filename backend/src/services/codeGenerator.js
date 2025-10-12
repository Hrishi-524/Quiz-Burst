import { customAlphabet } from 'nanoid';

const generateGameCode = () => {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
  return nanoid();
};

export default generateGameCode;