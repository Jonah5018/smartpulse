import {
  ContextEngine,
} from "./context-engine";

export class ContextBuilder {
  static build() {
    return ContextEngine.current();
  }
}