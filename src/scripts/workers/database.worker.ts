import { DatabaseActor } from '../actors/database.actor'
import { expose } from 'comlink'
import { isWorker } from '../helpers/browser.helper'

if (isWorker()) expose(DatabaseActor)