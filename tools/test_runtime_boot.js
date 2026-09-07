// tools/test_runtime_boot.js
// Giả lập môi trường browser để chạy thử Compiled_Core.html và bắt chính xác lỗi runtime

const fs = require('fs');
const path = require('path');

console.log('🧪 BẮT ĐẦU CHẠY THỬ RUNTIME CỦA COMPILED_CORE.HTML...');

// Mock browser globals
global.window = global;
global.document = {
  getElementById: (id) => {
    if (id === 'root') {
      return { style: {} };
    }
    return null;
  },
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    setAttribute: () => {},
    appendChild: () => {}
  }),
  body: {
    appendChild: () => {},
    style: {}
  },
  documentElement: {
    style: {
      setProperty: () => {}
    }
  },
  addEventListener: () => {}
};

global.navigator = { userAgent: 'Node' };
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock React 18 & ReactDOM
class Component {
  constructor(props) { this.props = props; this.state = {}; }
  setState() {}
}

const mockReact = {
  Component,
  createElement: (type, props, ...children) => ({ type, props, children }),
  memo: fn => fn,
  forwardRef: fn => fn,
  Fragment: 'Fragment',
  createContext: () => ({ Provider: () => {}, Consumer: () => {} }),
  useState: init => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useRef: init => ({ current: init }),
  useMemo: fn => fn(),
  useCallback: fn => fn,
  useContext: () => ({}),
  useReducer: (reducer, init) => [init, () => {}]
};

global.React = mockReact;
global.ReactDOM = {
  createRoot: (el) => ({
    render: (component) => {
      console.log('✅ ReactDOM.createRoot.render() đã được gọi thành công!');
    }
  }),
  createPortal: (children) => children
};

// Load Compiled_Core.html
const corePath = path.join(__dirname, '..', 'Compiled_Core.html');
let coreContent = fs.readFileSync(corePath, 'utf8');

// Strip <script> and </script>
coreContent = coreContent.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');

console.log(`📦 Độ dài mã nguồn Core: ${coreContent.length} ký tự. Bắt đầu eval...`);

try {
  eval(coreContent);
  console.log('🎉 EVAL COMPILED_CORE HOÀN TẤT THÀNH CÔNG KHÔNG LỖI!');
} catch (err) {
  console.error('❌ LỖI RUNTIME TRONG COMPILED_CORE:');
  console.error(err.stack || err);
  process.exit(1);
}
