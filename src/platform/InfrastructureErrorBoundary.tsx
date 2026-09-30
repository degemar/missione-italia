import {Component, type ReactNode} from 'react';

import {
  recoveryFor,
  type InfrastructureFailureKind,
  type RecoveryEntry,
} from './recovery-catalogue.js';

interface InfrastructureErrorBoundaryProps {
  readonly children: ReactNode;
  readonly failureKind: InfrastructureFailureKind;
  readonly onDiagnosticCode?: (code: RecoveryEntry['code']) => void;
  readonly fallback: (entry: RecoveryEntry, retry: () => void) => ReactNode;
}

interface InfrastructureErrorBoundaryState {
  readonly failed: boolean;
}

export class InfrastructureErrorBoundary extends Component<
  InfrastructureErrorBoundaryProps,
  InfrastructureErrorBoundaryState
> {
  state: InfrastructureErrorBoundaryState = {failed: false};

  static getDerivedStateFromError(): InfrastructureErrorBoundaryState {
    return {failed: true};
  }

  componentDidCatch(): void {
    this.props.onDiagnosticCode?.(recoveryFor(this.props.failureKind).code);
  }

  private readonly retry = () => this.setState({failed: false});

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return this.props.fallback(recoveryFor(this.props.failureKind), this.retry);
  }
}
