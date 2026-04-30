import Common "common";

module {
  public type Task = {
    id : Common.TaskId;
    projectId : Common.ProjectId;
    var title : Text;
    var description : Text;
    var dueDate : Common.Timestamp;
    var assignedTo : ?Common.UserId;
    var status : Common.TaskStatus;
    createdBy : Common.UserId;
    createdAt : Common.Timestamp;
  };

  public type TaskView = {
    id : Common.TaskId;
    projectId : Common.ProjectId;
    title : Text;
    description : Text;
    dueDate : Common.Timestamp;
    assignedTo : ?Common.UserId;
    status : Common.TaskStatus;
    createdBy : Common.UserId;
    createdAt : Common.Timestamp;
    isOverdue : Bool;
  };

  public type DashboardStats = {
    total : Nat;
    completed : Nat;
    pending : Nat;
    overdue : Nat;
  };
};
