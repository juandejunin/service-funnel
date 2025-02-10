import dotenv from 'dotenv';
dotenv.config()
import Server from './config/Server';

const server = new Server();

server.listen();