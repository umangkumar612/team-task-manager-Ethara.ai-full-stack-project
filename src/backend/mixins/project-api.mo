import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import ProjectTypes "../types/project";
import ProjectLib "../lib/project";

mixin (
  accessControlState : AccessControl.AccessControlState,
  projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
  nextProjectId : { var value : Nat },
) {
  public shared ({ caller }) func createProject(name : Text, description : Text) : async Common.ProjectId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to create a project");
    };
    let id = ProjectLib.createProject(projects, nextProjectId.value, name, description, caller);
    nextProjectId.value += 1;
    id;
  };

  public query ({ caller }) func getProject(id : Common.ProjectId) : async ?ProjectTypes.ProjectView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Only members can view the project
    let isMember = ProjectLib.isProjectMember(projects, id, caller);
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (not isMember and not isAdmin) {
      Runtime.trap("Unauthorized: Not a member of this project");
    };
    ProjectLib.getProject(projects, id);
  };

  public query ({ caller }) func listMyProjects() : async [ProjectTypes.ProjectView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.listProjectsForUser(projects, caller);
  };

  public shared ({ caller }) func updateProject(id : Common.ProjectId, name : Text, description : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.updateProject(projects, id, name, description, caller);
  };

  public shared ({ caller }) func deleteProject(id : Common.ProjectId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.deleteProject(projects, id, caller);
  };

  public shared ({ caller }) func addProjectMember(projectId : Common.ProjectId, userId : Common.UserId, role : Common.ProjectRole) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.addMember(projects, projectId, userId, role, caller);
  };

  public shared ({ caller }) func updateProjectMemberRole(projectId : Common.ProjectId, userId : Common.UserId, role : Common.ProjectRole) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.updateMemberRole(projects, projectId, userId, role, caller);
  };

  public shared ({ caller }) func removeProjectMember(projectId : Common.ProjectId, userId : Common.UserId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProjectLib.removeMember(projects, projectId, userId, caller);
  };
};
