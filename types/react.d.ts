// Временные типы для JSX до установки node_modules
declare namespace React {
  type ReactNode = any;
}

declare namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
