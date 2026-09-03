import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6 text-[#1d1d1f]">
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-black/[0.08] shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold">页面运行时错误</h2>
            <div className="text-left bg-red-50 p-4 rounded-xl text-red-800 text-xs font-mono overflow-auto max-h-60 whitespace-pre-wrap">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              🔄 清除所有缓存并重新载入
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

