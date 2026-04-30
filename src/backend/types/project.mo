import Common "common";

module {
  public type ProjectMember = {
    userId : Common.UserId;
    role : Common.ProjectRole;
  };

  public type Project = {
    id : Common.ProjectId;
    var name : Text;
    var description : Text;
    createdBy : Common.UserId;
    var members : [ProjectMember];
  };

  public type ProjectView = {
    id : Common.ProjectId;
    name : Text;
    description : Text;
    createdBy : Common.UserId;
    members : [ProjectMember];
  };
};
