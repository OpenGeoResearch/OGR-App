export default ({ app }, inject) => {
  const { router } = app

  let programmatic = false
  ;(['push', 'replace', 'go', 'back', 'forward']).forEach((methodName) => {
    const method = router[methodName]
    router[methodName] = (...args) => {
      programmatic = true
      method.apply(router, args)
    }
  })

  router.beforeEach((to, from, next) => {
    if (from.name === null || programmatic) {
      next()
    } else if (from.name === 'question' || from.name === 'account' || from.name === 'find' || from.name === 'explore' || from.name === 'series' || from.name === 'series-id') {
      next(false)
    } else {
      next()
    }
    programmatic = false
  })
}
