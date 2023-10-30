import BackgroundSyncWorker from '~/assets/BackgroundSync.worker.js'

export default (context, inject) => {
  inject('worker', {
    createWorker () {
      return new BackgroundSyncWorker()
    }
  })
}
