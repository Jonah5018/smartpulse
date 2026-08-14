import {
  ContextBuilder,
} from "./context-builder";

export class ContextService {
  static current() {
    return ContextBuilder.build();
  }
}