import type {
  TraderWorkspace,
} from "./workspace-types";

import { WorkspaceRepository } from "./workspace-repository";

export class WorkspaceContext {
  static async load(
    authUserId: string
  ): Promise<TraderWorkspace | null> {
    return WorkspaceRepository.load(
      authUserId
    );
  }
}