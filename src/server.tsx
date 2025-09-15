import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createRouter } from './router'

const Server = createStartHandler({
  createRouter,
})(defaultStreamHandler)

export default Server;