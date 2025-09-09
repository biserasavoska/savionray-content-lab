// LogRocket utility functions
export const identifyUser = (user: any) => {
  if (typeof window !== 'undefined' && (window as any).logRocketIdentify) {
    (window as any).logRocketIdentify(user)
  }
}

export const logEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && (window as any).LogRocket) {
    (window as any).LogRocket.track(eventName, properties)
  }
}

export const logError = (error: Error, context?: any) => {
  if (typeof window !== 'undefined' && (window as any).LogRocket) {
    (window as any).LogRocket.captureException(error, {
      extra: context
    })
  }
}
