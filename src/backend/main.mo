import Map "mo:core/Map";
import _Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Common "types/common";
import ProfileTypes "types/profile";
import ProjectTypes "types/project";
import TaskTypes "types/task";
import ProfileMixin "mixins/profile-api";
import ProjectMixin "mixins/project-api";
import TaskMixin "mixins/task-api";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Common.UserId, ProfileTypes.UserProfile>();
  include ProfileMixin(accessControlState, userProfiles);

  let projects = Map.empty<Common.ProjectId, ProjectTypes.Project>();
  let nextProjectId = { var value : Nat = 0 };
  include ProjectMixin(accessControlState, projects, nextProjectId);

  let tasks = Map.empty<Common.TaskId, TaskTypes.Task>();
  let nextTaskId = { var value : Nat = 0 };
  include TaskMixin(accessControlState, tasks, projects, nextTaskId);
};
