import type { Services } from '../application/ports'
import { apiServices } from './api/apiServices'
import { config } from './config'
import { mockServices } from './mock/mockServices'

export const services: Services = config.dataSource === 'api' ? apiServices : mockServices
