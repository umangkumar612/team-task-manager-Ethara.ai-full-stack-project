import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Common "../types/common";
import ProjectTypes "../types/project";

module {
  public func toView(project : ProjectTypes.Project) : ProjectTypes.ProjectView {
    {
      id = project.id;
      name = project.name;
      description = project.description;
      createdBy = project.createdBy;
      members = project.members;
    };
  };

  public func isProjectMember(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    projectId : Common.ProjectId,
    userId : Common.UserId,
  ) : Bool {
    switch (projects.get(projectId)) {
      case null false;
      case (?project) {
        project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
      };
    };
  };

  public func isProjectAdmin(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    projectId : Common.ProjectId,
    userId : Common.UserId,
  ) : Bool {
    switch (projects.get(projectId)) {
      case null false;
      case (?project) {
        project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId) and m.role == #admin
        });
      };
    };
  };

  public func createProject(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    nextId : Nat,
    name : Text,
    description : Text,
    caller : Common.UserId,
  ) : Common.ProjectId {
    let id = nextId;
    let project : ProjectTypes.Project = {
      id;
      var name = name;
      var description = description;
      createdBy = caller;
      var members = [{ userId = caller; role = #admin }];
    };
    projects.add(id, project);
    id;
  };

  public func getProject(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    id : Common.ProjectId,
  ) : ?ProjectTypes.ProjectView {
    switch (projects.get(id)) {
      case null null;
      case (?project) ?toView(project);
    };
  };

  public func listProjectsForUser(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    userId : Common.UserId,
  ) : [ProjectTypes.ProjectView] {
    let results = projects.entries().filterMap(
      func((_, project) : (Common.ProjectId, ProjectTypes.Project)) : ?ProjectTypes.ProjectView {
        let isMember = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
        if (isMember) ?toView(project) else null;
      }
    );
    results.toArray();
  };

  public func updateProject(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    id : Common.ProjectId,
    name : Text,
    description : Text,
    caller : Common.UserId,
  ) : Bool {
    switch (projects.get(id)) {
      case null false;
      case (?project) {
        let callerIsAdmin = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, caller) and m.role == #admin
        });
        if (not callerIsAdmin) {
          Runtime.trap("Unauthorized: Only project admins can update the project");
        };
        project.name := name;
        project.description := description;
        true;
      };
    };
  };

  public func deleteProject(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    id : Common.ProjectId,
    caller : Common.UserId,
  ) : Bool {
    switch (projects.get(id)) {
      case null false;
      case (?project) {
        let callerIsAdmin = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, caller) and m.role == #admin
        });
        if (not callerIsAdmin) {
          Runtime.trap("Unauthorized: Only project admins can delete the project");
        };
        projects.remove(id);
        true;
      };
    };
  };

  public func addMember(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    projectId : Common.ProjectId,
    userId : Common.UserId,
    role : Common.ProjectRole,
    caller : Common.UserId,
  ) : Bool {
    switch (projects.get(projectId)) {
      case null false;
      case (?project) {
        let callerIsAdmin = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, caller) and m.role == #admin
        });
        if (not callerIsAdmin) {
          Runtime.trap("Unauthorized: Only project admins can add members");
        };
        // Check if already a member
        let alreadyMember = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
        if (alreadyMember) {
          return false;
        };
        let newMember : ProjectTypes.ProjectMember = { userId; role };
        project.members := project.members.concat([newMember]);
        true;
      };
    };
  };

  public func updateMemberRole(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    projectId : Common.ProjectId,
    userId : Common.UserId,
    role : Common.ProjectRole,
    caller : Common.UserId,
  ) : Bool {
    switch (projects.get(projectId)) {
      case null false;
      case (?project) {
        let callerIsAdmin = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, caller) and m.role == #admin
        });
        if (not callerIsAdmin) {
          Runtime.trap("Unauthorized: Only project admins can update member roles");
        };
        let exists = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
        if (not exists) {
          return false;
        };
        project.members := project.members.map<ProjectTypes.ProjectMember, ProjectTypes.ProjectMember>(
          func(m) {
            if (Principal.equal(m.userId, userId)) { { m with role } } else m
          }
        );
        true;
      };
    };
  };

  public func removeMember(
    projects : Map.Map<Common.ProjectId, ProjectTypes.Project>,
    projectId : Common.ProjectId,
    userId : Common.UserId,
    caller : Common.UserId,
  ) : Bool {
    switch (projects.get(projectId)) {
      case null false;
      case (?project) {
        let callerIsAdmin = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, caller) and m.role == #admin
        });
        if (not callerIsAdmin) {
          Runtime.trap("Unauthorized: Only project admins can remove members");
        };
        let exists = project.members.any(func(m : ProjectTypes.ProjectMember) : Bool {
          Principal.equal(m.userId, userId)
        });
        if (not exists) {
          return false;
        };
        project.members := project.members.filter(func(m : ProjectTypes.ProjectMember) : Bool {
          not Principal.equal(m.userId, userId)
        });
        true;
      };
    };
  };
};
