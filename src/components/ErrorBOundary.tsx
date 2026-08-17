import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }

type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("RECLAIM render error", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-slate-50 p-6 text-center">
          <div>
            <h1 className="font-display text-2xl text-navy">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please reload RECLAIM to continue your recovery request.
            </p>
            <button
              className="mt-5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
              onClick={() => window.location.reload()}
            >
              Reload RECLAIM
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
